import ProgressBar from "../mod.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  // here ==>
  display: ":bar :eta",
  // display: ":bar :percent :time :eta",
  // display: ":bar :percent elapsed :time eta :eta",
  // <== here
});

let completed = 0;

function run() {
  if (completed <= total) {
    progress.render(completed++);

    setTimeout(function () {
      run();
    }, 100);
  }
}

run();
