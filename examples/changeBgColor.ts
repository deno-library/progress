import ProgressBar from "../mod.ts";
import {
  bgMagenta,
  bgCyan,
} from "../example_deps.ts";

const total = 100;

const progress = new ProgressBar({
  total,
});

let completed = 0;

function run() {
  if (completed <= total) {
    if (completed >= 20) {
      progress.render(completed++, {
        // ==> here
        complete: bgMagenta(" "),
        incomplete: bgCyan(" "),
        // <== here
      });
    } else {
      progress.render(completed++);
    }

    setTimeout(function () {
      run();
    }, 50);
  }
}

run();
