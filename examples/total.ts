import ProgressBar from "../mod.ts";
import { delay } from "../deps_example.ts";

const title = "total test";
const total = 100;

const progress = new ProgressBar({
  title,
  // Can also be set within the render method
  // total
});

let completed = 0;

async function download() {
  while (completed <= total) {
    // Can also be set in the constructor
    // ==> here
    progress.render(completed++, { total });
    // <== here

    await delay(50);
  }
}

await download();
