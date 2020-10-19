import ProgressBar from "../mod.ts";
import {
  bgWhite,
  green,
} from "https://deno.land/std@0.74.0/fmt/colors.ts";

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

function downloading() {
  if (completed <= total) {
    progress.render(completed++);

    setTimeout(function () {
      downloading();
    }, 100);
  }
}

downloading();
