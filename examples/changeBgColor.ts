import ProgressBar from "../mod.ts";
import { bgCyan, bgMagenta, delay } from "../deps_example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
});

let completed = 0;

async function run() {
  while (completed <= total) {
    if (completed >= 20) {
      await progress.render(completed++, {
        // ==> here
        complete: bgMagenta(" "),
        incomplete: bgCyan(" "),
        // <== here
      });
    } else {
      await progress.render(completed++);
    }

    await delay(20);
  }
}

await run();
