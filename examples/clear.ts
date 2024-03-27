import ProgressBar from "../mod.ts";
import { delay } from "@std/async";

const total = 100;

const progress = new ProgressBar({
  total,
  // ==> here
  clear: true,
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
