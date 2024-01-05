import { MultiProgressBar } from "../mod.ts";
import { delay } from "../deps_test.ts";

Deno.test(`Use MultiProgressBar in a deno test`, async () => {
  const title = "download files";
  const total = 100;

  const bars = new MultiProgressBar({
    title,
    // clear: true,
    complete: "=",
    incomplete: "-",
    display: "[:bar] :text :eta",
  });

  let completed1 = 0;
  let completed2 = 0;

  while (completed1 <= total || completed2 <= total) {
    completed1 += 1;
    completed2 += 2;
    bars.render([
      {
        completed: completed1,
        total,
        text: "file1",
        complete: "*",
        incomplete: ".",
      },
      { completed: completed2, total, text: "file2" },
    ]);

    await delay(100);
  }
});
