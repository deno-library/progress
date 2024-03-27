import ProgressBar from "../mod.ts";
import { delay } from "@std/async";

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

async function download() {
  while (completed <= total) {
    await progress.render(completed++, {
      prettyTimeOptions: {
        withSpaces: true,
        toFixedVal: 0,
        longFormat: true,
      },
    });

    await delay(1000);
  }
}

await download();
