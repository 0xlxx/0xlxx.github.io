import { Icon } from "@iconify-icon/react";
import Link from "next/link";
export default function Page() {
  return (
    <div className="container mx-auto">
      <section className="flex flex-col gap-8 py-20 md:gap-16 items-center">
        <div className="animate-in slide-in-from-bottom">
          <div className="prose dark:prose-invert">
            <h1 className="tracking-tight">Bjorn Li</h1>
            <p>
              {`Hey , I'm a web developer and optimist. Currently working on Web3D and AI related projects. I'm also interested in visualization technology.`}
            </p>

            <h2>Find me on</h2>
            <ul className="flex flex-col grid grid-cols-4">
              <li className="flex gap-4">
                <Icon icon="mdi:github" width={24} />{" "}
                <Link href="https://github.com/lxxorz">Github</Link>
              </li>
              <li className="flex gap-4">
                <Icon icon="mdi:web" width={24} />{" "}
                <Link href="https://observablehq.com/@lxxorz">Observable</Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
