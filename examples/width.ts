import ProgressBar from "../mod.ts";
import { delay } from "../deps_example.ts";

const title = "interval:";
const total = 100;

const progress = new ProgressBar({
  title,
  total,
  // here ==>
  // width: 20
  width: 1000, // longer than the terminal width
  // <== here
});

let completed = 0;

async function download() {
  while (completed <= total) {
    progress.render(completed++);

    await delay(50);
  }
}

await download();
