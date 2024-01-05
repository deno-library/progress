import ProgressBar from "../mod.ts";
import { delay, green, yellow } from "../deps_example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  complete: "=",
  incomplete: "-",
});

let completed = 0;

async function download() {
  while (completed <= total) {
    if (completed >= 20) {
      progress.render(completed++, {
        // ==> here
        complete: green("="),
        incomplete: yellow("-"),
        // <== here
      });
    } else {
      progress.render(completed++);
    }

    await delay(20);
  }
}

await download();
