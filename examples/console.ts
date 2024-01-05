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
    await progress.render(completed++);

    // here ==>
    if (completed % 20 === 0) await progress.console(completed);
    // <== here

    await delay(50);
  }
}

await download();
