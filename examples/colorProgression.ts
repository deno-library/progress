import ProgressBar from "../mod.ts";
import { bgRgb24 } from "../deps.example.ts";
import { delay } from "../deps.example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
});

let completed = 0;

async function download() {
  while (completed <= total) {
    await progress.render(completed++, {
      // ==> here
      complete: bgRgb24(" ", { r: 128, g: (completed / total) * 255, b: 0 }),
      // <== here
    });

    await delay(20);
  }
}

await download();
