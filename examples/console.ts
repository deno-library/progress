import ProgressBar from "../mod.ts";
import { delay } from "../deps_example.ts";

const title = "interval:";
const total = 100;

const progress = new ProgressBar({
  title,
  total,
});

let completed = 0;

async function download() {
  while (completed <= total) {
    progress.render(completed++);
    // here ==>
    if (completed % 20 === 0) progress.console(completed);
    // <== here

    await delay(20);
  }
}

await download();
