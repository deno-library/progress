import ProgressBar from "../mod.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  complete: "=",
  incomplete: "-",
  display: ":bar :percent elapsed :time eta :eta",
  // here ==>
  prettyTime: true,
  // <== here
});

let completed = 0;

function run() {
  if (completed <= total) {
    progress.render(completed++, {
      prettyTimeOptions: {
        withSpaces: true,
        toFixedVal: 0,
        longFormat: true,
      },
    });

    setTimeout(function () {
      run();
    }, 1000);
  }
}

run();
