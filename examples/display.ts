import ProgressBar from "../mod.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  complete: "=",
  incomplete: "-",
  // here ==>
  // display: ':bar'
  // display: ':bar :time'
  // display: '[:bar]'
  // display: 'hello :bar world'
  display: ":completed/:total hello :time [:bar] :percent",
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
