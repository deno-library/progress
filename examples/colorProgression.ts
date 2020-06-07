import ProgressBar from "../mod.ts";
import { bgRgb24 } from "https://deno.land/std@0.50.0/fmt/colors.ts";

const total = 100;

const progress = new ProgressBar({
  total,
});

let completed = 0;

function run() {
  if (completed <= total) {
    progress.render(completed++, {
      // ==> here
      complete: bgRgb24(" ", { r: 128, g: completed / total * 255, b: 0 }),
      // <== here
    });

    setTimeout(function () {
      run();
    }, 50);
  }
}

run();
