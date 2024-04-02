import { MultiProgressBar } from "../mod.ts";
import {
  simpleCallbackTarget,
  timerSource,
} from "rx_webstreams";

const bars = new MultiProgressBar({ title: "Downloading Files: " });

const timer1 = timerSource({
  maxEventCount: 100,
  intervalInMilliseconds: 40,
});

const timer2 = timerSource({
  maxEventCount: 100,
  intervalInMilliseconds: 60,
});

const timer3 = timerSource({
  maxEventCount: 100,
  intervalInMilliseconds: 70,
});

const progressArray = [
  { completed: 0, total: 100, text: "Timer 1" },
  { completed: 0, total: 100, text: "Timer 2" },
  { completed: 0, total: 100, text: "Timer 3" },
];

const renderProgress = () => {
  bars.render(progressArray);
};

const promise1 = timer1.pipeTo(
  simpleCallbackTarget((progress) => {
    progressArray[0].completed = progress;
    renderProgress();
  }),
);

const promise2 = timer2.pipeTo(
  simpleCallbackTarget((progress) => {
    progressArray[1].completed = progress;
    renderProgress();
  }),
);

const promise3 = timer3.pipeTo(
  simpleCallbackTarget((progress) => {
    progressArray[2].completed = progress;
    renderProgress();
  }),
);

await Promise.all([promise1, promise2, promise3]);

// Needed to not crush deno test (probably due to timer3 not running correctly for some reason)
// bars.end();
