import ProgressBar from "../mod.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  // ==> here
  clear: true,
  // <== here
});

let completed = 0;

function run() {
  if (completed <= total) {
    progress.render(completed++);

    setTimeout(function () {
      run();
    }, 50);
  }
}

run();
