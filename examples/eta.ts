import ProgressBar from "../mod.ts";
import { delay } from "../deps_example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  // here ==>
  // display: ":bar :eta",
  // display: ":bar :percent :time :eta",
  display: ":bar :percent elapsed :time eta :eta",
  // <== here
});

let completed = 0;

async function download() {
  while (completed <= total) {
    await progress.render(completed++);

    await delay(20);
  }
}

await download();
