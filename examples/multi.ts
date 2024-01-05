import { MultiProgressBar } from "../mod.ts";
import { delay } from "../deps_example.ts";

const title = "download files";
const total = 100;

const bars = new MultiProgressBar({
  title,
  // clear: true,
  complete: "=",
  incomplete: "-",
  display: "[:bar] :text :eta",
});

let completed1 = 0;
let completed2 = 0;

async function downloading() {
  while (completed1 <= total || completed2 <= total) {
    completed1 += 1;
    completed2 += 2;
    await bars.render([
      {
        completed: completed1,
        total,
        text: "file1",
        complete: "*",
        incomplete: ".",
      },
      { completed: completed2, total, text: "file2" },
    ]);

    await delay(50);
  }
}

await downloading();
