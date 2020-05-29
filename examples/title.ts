import ProgressBar from '../mod.ts'

const title = 'progress:';
const total = 100;

const progress = new ProgressBar({
  // here ==>
  title,
  // <== here
  total
});

let completed = 0;

function downloading() {
  if (completed <= total) {
    progress.render(completed++);

    setTimeout(function () {
      downloading();
    }, 50)
  }
}

downloading();