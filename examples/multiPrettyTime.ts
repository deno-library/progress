import { MultiProgressBar } from "../mod.ts";
import { delay } from "../deps_example.ts";

const title = "download files";
const total = 100;

const bars = new MultiProgressBar({
  title,
  // clear: true,
  complete: "=",
  incomplete: "-",
  display: "[:bar] :text time: :time tea: :eta",
  prettyTime: true,
});

let completed1 = 0;
let completed2 = 0;

async function download() {
  if (completed1 <= total || completed2 <= total) {
    completed1 += 1;
    completed2 += 2;
    await bars.render([
      {
        completed: completed1,
        total,
        text: "file1",
        complete: "*",
        incomplete: ".",
        prettyTimeOptions: {
          withSpaces: true,
          toFixedVal: 0,
          longFormat: true,
        },
      },
      {
        completed: completed2,
        total,
        text: "file2",
        prettyTimeOptions: {
          withSpaces: false,
          toFixedVal: 2,
          longFormat: false,
        },
      },
    ]);

    await delay(1000);
  }
}

await download();
