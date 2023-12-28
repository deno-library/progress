import { FunnyProgressBar } from "../funny.ts";

const total = 100;

const image = `
                                                           __
                              .__                         / |
                             /  /                         |  \\
                            /   |                     _-------'_
                       ____/     \\_________      __--"      _/  \\_
         _______------"                    "----"          _-\\___/
     _--"                                               _-"
 ___<___                                          ___--"
(-------0                                   __---"
 \`--___                                    /
       "--___\\                _______-----"
             \\\\    (____-----"
              \\\\    \\_
               \`.\`..__\\
`;

const progress = new FunnyProgressBar({
  total,
//   complete: "=",
//   incomplete: "-",
    // vertical: false,
    display:":title :bar :text :time :completed/:total :percent"
});

let completed = 0;

function run() {
  if (completed <= total) {
    progress.render(completed++, image);

    setTimeout(function () {
      run();
    }, 50);
  }
}

run();
