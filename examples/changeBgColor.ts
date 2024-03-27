import ProgressBar from "../mod.ts";
import { bgCyan, bgMagenta } from "@std/fmt/colors";
import { delay } from "@std/async";

const total = 100;

const progress = new ProgressBar({
  total,
});

let completed = 0;

async function download() {
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

await download();
