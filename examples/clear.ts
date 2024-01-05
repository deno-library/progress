import ProgressBar from "../mod.ts";
import { delay } from "../deps_example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  // ==> here
  clear: true,
  // <== here
});

let completed = 0;

async function run() {
  while (completed <= total) {
    await progress.render(completed++);

    await delay(20);
  }
}

await run();
