const mdxContent = `
# Real Heading 1

Some text.

\`\`\`bash
# This is a comment in code
npm install
\`\`\`

# Real Heading 2
`;

function test() {
  const headingLines = mdxContent.split('\n').filter((line) => {
    return line.match(/^#{1,6}\s/)
  })

  console.log("Detected lines:", headingLines);
  
  if (headingLines.length > 2) {
    console.log("FAIL: Detected comment in code block as heading");
  } else {
    console.log("PASS: Correctly ignored code block");
  }
}

test();
