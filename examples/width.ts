import ProgressBar from '../mod.ts'

const title = 'interval:';
const total = 100;

const progress = new ProgressBar({
  title,
  total,
  // here ==> 
  // width: 20
  width: 1000  // longer than the terminal width
  // <== here
});

let completed = 0;

function downloading() {
  if (completed <= total) {
    progress.render(completed++);

    setTimeout(function () {
      downloading();
    }, 100)
  }
}

downloading();