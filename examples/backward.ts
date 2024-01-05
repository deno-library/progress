import ProgressBar from "../mod.ts";
import { delay } from "../deps_example.ts";

const progress = new ProgressBar({
  title: "backward",
  total: 100,
});

let completed = 0;

async function forward() {
  while (completed <= 60) {
    progress.render(completed++);
    await delay(20);
  }

  await backward();
}

async function backward() {
  while (completed > 0) {
    // ==> here
    progress.render(--completed);
    // <== here
    await delay(20);
  }
  progress.end();
}

await forward();
