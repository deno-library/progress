import ProgressBar from "../mod.ts";

const title = "interval:";
const total = 100;

const progress = new ProgressBar({
  title,
  total,
});

let completed = 0;

function downloading() {
  if (completed <= total) {
    progress.render(completed++);
    // here ==>
    if (completed % 20 === 0) progress.console(completed);
    // <== here

    setTimeout(function () {
      downloading();
    }, 50);
  }
}

downloading();
