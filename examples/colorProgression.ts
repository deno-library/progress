import ProgressBar from "../mod.ts";
import { bgRgb24,delay } from "../deps_example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
});

let completed = 0;

async function download() {
  while (completed <= total) {
    progress.render(completed++, {
      // ==> here
      complete: bgRgb24(" ", { r: 128, g: completed / total * 255, b: 0 }),
      // <== here
    });

    await delay(20);
  }
}

await download();
