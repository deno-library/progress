import ProgressBar from "../mod.ts";
import { delay } from "@std/async";

const progress = new ProgressBar({
  title: "backward",
  total: 100,
});

let completed = 0;

async function forward() {
  while (completed <= 60) {
    await progress.render(completed++);
    await delay(20);
  }
  await backward();
}

async function backward() {
  while (completed > 0) {
    // ==> here
    await progress.render(--completed);
    // <== here
    await delay(20);
  }
  progress.end();
}

forward();
