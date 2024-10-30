import ProgressBar from "../mod.ts";
import { delay } from "../deps.example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  // ==> here
  output: Deno.stderr,
  // <== here
});

let completed = 0;

async function download() {
  while (completed <= total) {
    await progress.render(completed++);

    await delay(50);
  }
}

await download();
