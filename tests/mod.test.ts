import ProgressBar from "../mod.ts";
import { simpleTimerStream } from "../dev_deps.ts";

Deno.test(`Use ProgressBar in a deno test`, async () => {
  const progress = new ProgressBar({ title: "downloading: ", total: 50 });

  const timer = simpleTimerStream({
    maxEventCount: 100,
    intervalInMilliseconds: 50,
  });

  for await (const event of timer) {
    progress.render(event);
  }
});
