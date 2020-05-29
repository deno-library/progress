
import ProgressBar from '../mod.ts'

const progress = new ProgressBar({
  title: 'backward',
  total: 100
});

let completed = 0;

function forward() {
  progress.render(completed++);
  if (completed > 60) {
    backward();
  } else {
    setTimeout(forward, 20);
  }
}

function backward() {
  progress.render(--completed);
  if (completed == 0) {
    progress.end();
  } else {
    setTimeout(backward, 50);
  }
}

forward();
