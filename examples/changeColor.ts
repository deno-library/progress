import ProgressBar from "../mod.ts";
import { green, yellow } from "colors";
import { delay } from "@std/async";

const total = 100;

const progress = new ProgressBar({
  total,
  complete: "=",
  incomplete: "-",
});

let completed = 0;

async function download() {
  while (completed <= total) {
    if (completed >= 20) {
      await progress.render(completed++, {
        // ==> here
        complete: green("="),
        incomplete: yellow("-"),
        // <== here
      });
    } else {
      await progress.render(completed++);
    }

    await delay(20);
  }
}

await download();
