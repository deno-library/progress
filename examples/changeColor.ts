import ProgressBar from '../mod.ts'
import {
  yellow,
  green
} from "https://deno.land/std@0.50.0/fmt/colors.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  complete: '=',
  incomplete: '-'
});

let completed = 0;

function run() {
  if (completed <= total) {

    if (completed >= 20) {
      progress.render(completed++, {
        complete: green('='),
        incomplete: yellow('-')
      });
    } else {
      progress.render(completed++);
    }

    setTimeout(function () {
      run();
    }, 50)
  }
}

run();