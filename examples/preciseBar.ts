import ProgressBar from "../mod.ts";
import { bgWhite, green } from "@std/fmt/colors";
import { delay } from "@std/async";

const total = 100;

const progress = new ProgressBar({
  total,
  // Note: on Windows, if UTF-8 is not the default encoding for the terminal, such characters will not be displayed as expected.
  // ==> here
  preciseBar: [
    bgWhite(green("▏")),
    bgWhite(green("▎")),
    bgWhite(green("▍")),
    bgWhite(green("▌")),
    bgWhite(green("▋")),
    bgWhite(green("▊")),
    bgWhite(green("▉")),
  ],
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
