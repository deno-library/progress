import ProgressBar from "../mod.ts";
import { delay } from "../deps.example.ts";

const total = 100;

const progress = new ProgressBar({
  total,
  complete: "=",
  incomplete: "-",
  // here ==>
  // display: ':bar'
  // display: ':bar :time'
  // display: '[:bar]'
  // display: 'hello :bar world'
  display: ":completed/:total hello :time [:bar] :percent",
  // <== here
});

let completed = 0;

async function download() {
  while (completed <= total) {
    await progress.render(completed++);

    await delay(20);
  }
}

await download();
