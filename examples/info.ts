import ProgressBar from "../mod.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  // ==> here
  display: ':bar :title',
  // <== here
});

let completed = 0;

function* log() {
  yield "INFO: started"
  yield "WARN         "
  yield "ERROR: X     "
  yield "custom text  "
  yield "end          "
}

const info = log()

function run() {
  if (completed <= total) {
    progress.render(completed++, {
      title: completed % 20 === 0 ? info.next().value + "" : ""
    });

    setTimeout(function () {
      run();
    }, 50);
  }
}

run();
