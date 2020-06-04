import ProgressBar from '../mod.ts'

const title = 'total test';
const total = 100;

const progress = new ProgressBar({
  title,
  // Can also be set within the render method
  // total
});

let completed = 0;

function downloading() {
  if (completed <= total) {
    // Can also be set in the constructor
    progress.render(completed++, { total });

    setTimeout(function () {
      downloading();
    }, 100)
  }
}

downloading();