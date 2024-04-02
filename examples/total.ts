import ProgressBar from "../mod.ts";
import { delay } from "../deps.example.ts";

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
    await progress.render(completed++, { total });
    // <== here

    await delay(20);
  }
}

await download();
