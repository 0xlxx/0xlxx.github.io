---
title: 基于 AST 的项目接口引用分析
publishedAt: 2024-01-09
summary: 基于AST的函数引用分析
---

## 背景

需求是：获取指定模块中的函数引用数据

例如，找到`apiA()`函数在`main.js`以及其依赖中的引用

![alt text](/images/react/ast/preview.avif)

## 设计

1. 获取所有的函数定义,扫描整个项目，找出所有的函数定义，保存到一个对象当中。函数定义可以通过函数名和文件路径来唯一识别（不考虑匿名函数默认导出的情况）

```js
[
  {
    name: 'getSth',
    file: '/src/api/menu.js'
  },
  // ...
]
```

2. 获取所有的函数引用

  通过目标路径下的入口文件 比如 `main.js`。构造一个依赖图，找出所有文件的依赖情况。

  ![deps](/images/react/ast/deps.avif)

  分析该路径下每个文件的的函数引用，最后生成一个函数引用图。最终可以得到一个路径下的函数引用情况。

```js
// A.js
import {getSth, deleteSth} from "/api/menu.js"
```

![file-api](/images/react/ast/file-api.avif)

遍历整张图，累加每个文件的所有的函数引用即可获得最终结果

![graph](/images/react/ast/graph.avif)

`main.js`文件的函数引用数量等于自身的函数引用数量加上 `A.js`和`B.js`以及`c.js`的函数引用数量之和

## 构造依赖图

构造一个文件依赖图，这就是我们常用的构建工具的功能。比如 rollup, esbuild等。

首先获取入口文件 `main.js`，从入口文件开始递归遍历依赖文件（只考虑 ESM）

```js
// main.js
import A from "./A.js"
```

### 正则表达式的缺陷

从源代码当中提取import语句可以使用正则表达式。但是正则表达式有一定的限制，无法匹配过于复杂的规则。

以下是 StackOverflow当中给出的一个匹配`import`语句解决方案

```js
/import([ \n\t]*(?:[^ \n\t\{\}]+[ \n\t]*,?)?(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])/
```

可以看到，正则表达式的长度的构造有点复杂且可读性差。更重要的是，对于复杂的文本。正则表达式没有经过充分的测试修正，导致满足不了 edge case。 很容易就死循环了😅。

这里还仅仅考虑了 在JavaScript ，如果使用 Typescript，需要将 `import type` 或者`import {type xxx}` 之类的排除在外,就更加复杂

而且其文法本身也有限制，不能匹配规则之外的文本。

## 什么是AST

除了正则表达式，还有一种可行的方法是将源代码转换成AST，然后遍历AST，提取出我们需要的内容。

在计算机科学中，抽象语法树，是源代码语法结构的一种抽象表示。它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构

比如 `2 * 3 + 7`这个表达式可以表示成如下的AST

> 根据使用的转换工具不同，ast具体的数据结构都有所不同

![ast](/images/react/ast/ast.avif)

### 遍历 AST

这里以 [swc](https://swc.rs/) 为例,这是一个使用 Rust 编写的开发者工具，支持将 JavaScript和Typescript 代码转换为 AST。

下面将 `2 * 3 + 7`这个表达式转换成AST

[ast playground](https://ast.sxzz.moe/#eNqrVspRslLKSixLLE4uyiwoUdJRKgAKFJcnA1nJQJaRgpaCsYK2gjmQnw/kV8fkKSjEKBVX5pUkVsQoWQHZJZUFqRDdMUoxebVKtQANARlE)

因为我们想要获取 `import` 语句内容，所以需要遍历整个AST,找到所有的`import`语句节点。

这里使用生成器函数来实现AST遍历

```ts
import * as swc from "@swc/core";

export function* forEachNode(node: swc.Node): Generator<swc.Node> {
  if (node.type !== "Module")
    yield node;

  for (const key in node) {
    // @ts-ignore
    const child = node[key] as swc.Node;

    if (typeof child === "object" && child != null) {
      const children = Array.isArray(child) ? child : [child as swc.Node];

      for (const item of children) {
        if (item) {
          yield* forEachNode(item);
        }
      }
    }
  }
}
```

## 获取函数定义

当可以遍历 AST 之后，就需要找到项目当中所有的函数定义，函数定义有两种情况

1. 函数声明 `export function name() {}`
2. 变量声明 `export const name = function() {}` 或者 `const name = () => {}`

[ast playground](https://ast.sxzz.moe/#eNotjc0KwzAMg1/F6LTBLtux0D2JL8G00DGckLh/hLx7XdqD4EMSUsUfHX5hCUXylAwvJDfKKk7iNGwpZqNxVrEpKo3vx5Nq48x66o4lavHSh3ryuP/eDd+IvlFZiRhlVwsbo3O2PQ3XI4O1oR0DTS0F)

语法树的可视化如图所示(忽略了一些节点和层级关系)，

![alt text](/images/react/ast/parse-fn.avif)

```ts
const FILES = [
  "/src/api/a.js",
  "/src/api/b.js",
];

let function_definition = [];

for(const file of FILES) {
  // 将文件转换成AST
  const ast = parseFile(file);
  // 获取函数定义
  function_definition.push(...arseFunctions(ast));
}


function parseFunctions(ast: swc.Module, file: string) {
  const defs = [];
  traverse(ast, {
    visitExportDeclaration(node) {
      traverse(node.declaration, {
        visitFunctionDeclaration(node) {
          // ...
          defs.push({
            name: identifier.value,
            source_file: file
          });
        },
        visitVariableDeclaration(node) {
          // ...
          defs.push({
            name: id.value,
            source_file: file
          });
        }
      })
    }
  })
  return defs
}
```

```ts
type Visitor = {
  visitExportDeclaration?(node: swc.ExportDeclaration): void;
  visitFunctionDeclaration?(node: swc.FunctionDeclaration): void;
  visitVariableDeclaration?(node: swc.VariableDeclaration): void;
  // ...
};

export function traverse(node: swc.Node, visitor: Visitor) {
  for (const child of forEachNode(node)) {
    switch (child.type) {
      case "ExportDeclaration":
        visitor.visitExportDeclaration?.(child as swc.ExportDeclaration);
        break;
      case "FunctionDeclaration":
        visitor.visitFunctionDeclaration?.(child);
        break;
      case "VariableDeclaration":
        visitor.visitVariableDeclaration?.(child);
        break;
      // ...
    }
  }
}
```

## 提取函数引用

当我们获取到了 `import` ast 节点之后，还需要从该节点当中取出函数标识符以及源文件

例如 `import { name } from "source-file` 我们需要提取出 `name` 和 `source-file`

在`JavaScript`当中`import`一个函数有多种情况

```js
// 具名导入：
import { export1, export2 } from "module-name";

// 默认导入：
import defaultExport from "module-name";

// 命名空间导入：
import * as name from "module-name";

// 副作用导入：
import "module-name";
```

然后还需要考虑别名

```ts
import {export1 as alias1} from "module-name";
```

同样的遍历所有的 `ImportDeclaration`节点，提取出函数标识符和文件名。

[ast playground](https://ast.sxzz.moe/#eNoljDsKxDAMBa8iXh122S1zFjXCxOCQ2MIy+WB89wjSDQMzHRtmrHKIhZq0YYK6sDM4Bae0a6mNevxNFP8kRrIlsUGxlp0Youkrn9UYHhQPOmdyb3ducjFm53br8u4ZnAfGA5r1JeQ=)

分析语法树结构

![alt text](/images/react/ast/import-declaration.avif)

下面代码只处理了 具名导入 `import {export1} from "module-name"` 和 具体导入别名的情况`import {export1 as alias1} from "module-name"`的情况。以及排除了 Typescript 代码中的类型导入

```ts
type Visitor = {
  visitImportDeclaration?(node: swc.ImportDeclaration): void;
  // ...
};

export function traverse(node: swc.Node, visitor: Visitor) {
  for (const child of forEachNode(node)) {
    switch (child.type) {
      case "ImportDeclaration":
        visitor.visitImportDeclaration?.(child as swc.ImportDeclaration);
        break;
      // ...
    }
  }
}
```

```ts
// 找到所有的函数引用
function parseReference(ast: swc.Module) {
  // 保存函数标识符和源文件
  const function_reference = [];

  traverse(ast, {
    visitImportDeclaration(node) {
      // 处理源文件中的路径别名
      const reference_file = resolveAlias(node.source.value, ALIAS);
      for (const specifier of node.specifiers) {
        if (specifier.type === "ImportSpecifier" && !specifier.isTypeOnly) {
          let name = "";
          // 考虑函数别名
          if (specifier.imported?.type === "Identifier") {
            name = specifier.imported.value;
          } else {
            name = specifier.local.value;
          }
          function_reference.push({
            name,
            reference_file,
          });
        }
      }
    },
  });
  return function_reference;
}
```

当我们能够解析一个文件的函数定义以及函数引用之后，接下来就可以继续获取当前文件的依赖的函数引用，最终当遍历完所以的文件之后，就会得到一块完整的拼图

```ts
const REFERENCE = new Map();

// 找到所有依赖文件
function parseDeps(ast: swc.Module) {
  const deps = [];
  traverse(ast, {
    visitImportDeclaration(node) {
      deps.push(node.source.value);
    }
  });
  return deps;
}

function parseFile(file: string) {

  // 将文件解析成 ast
  const ast = parse(file);

  // 获取所有的依赖
  const deps = parseDeps(ast);
  // ["/src/api/a.js", "/src/api/b.js"]

  const reference = parseReference(ast);

  REFERENCE.set(file, {reference, deps});

  for(const dep of deps) {
    parseFile(dep);
  }
}


parseFile('main.js');
```

最终对每个文件的函数引用进行遍历累加，就可以得到指定文件下所有依赖包括自身的函数引用

```ts
function merge(file: string) {
  const {reference, deps} = REFERENCE.get(file);
  let result = reference;
  for(const dep of deps) {
    result = result.concat(merge(dep));
  }
  return result;
}

const data = merge('main.js')
```

最后可能需要对数据进行一些处理，比如去重、计数等等
