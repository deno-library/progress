import ProgressBar from "../mod.ts";
import { delay } from "../deps_example.ts";

const title = "progress:";
const total = 100;

const progress = new ProgressBar({
  // here ==>
  title,
  // <== here
  total,
});

let completed = 0;

async function download() {
  while (completed <= total) {
    await progress.render(completed++);

    await delay(50);
  }
}

await download();
