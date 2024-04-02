import ProgressBar from "../mod.ts";
import { delay } from "../deps.example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  // ==> here
  complete: "=",
  incomplete: "-",
  // <== here
});

let completed = 0;

async function download() {
  while (completed <= total) {
    progress.render(completed++);

    await delay(20);
  }
}

await download();
