import ProgressBar from "../mod.ts";
import { delay } from "../deps_example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  // ==> here
  display: ":bar :title",
  // <== here
});

let completed = 0;

function* log() {
  yield "INFO: started";
  yield "WARN         ";
  yield "ERROR: X     ";
  yield "custom text  ";
  yield "end          ";
}

const info = log();

async function run() {
  while (completed <= total) {
    await progress.render(completed++, {
      title: completed % 20 === 0 ? info.next().value + "" : "",
    });

    await delay(100);
  }
}

await run();
