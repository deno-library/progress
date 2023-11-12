import { bgGreen, bgWhite, stripAnsiCode, writeAllSync } from "./deps.ts";
import { prettyTime, prettyTimeOptions } from "./time.ts";
export { MultiProgressBar } from "./multi.ts";

const hasStdout = Deno.stdout;

const enum Direction {
  left,
  right,
  all,
}

interface constructorOptions {
  title?: string;
  total?: number;
  width?: number;
  complete?: string;
  preciseBar?: string[];
  incomplete?: string;
  clear?: boolean;
  interval?: number;
  display?: string;
  prettyTime?: boolean;
}

interface renderOptions {
  title?: string;
  total?: number;
  text?: string;
  complete?: string;
  preciseBar?: string[];
  incomplete?: string;
  prettyTimeOptions?: prettyTimeOptions;
}

export default class ProgressBar {
  title: string;
  total?: number;
  width: number;
  complete: string;
  preciseBar: string[];
  incomplete: string;
  clear: boolean;
  interval: number;
  display: string;
  prettyTime: boolean;

  private isCompleted = false;
  private lastStr = "";
  private lastStrLen = 0;
  private start = Date.now();
  private lastRenderTime = 0;
  private encoder = new TextEncoder();

  // Note from @bjesuiter: This MUST be a Lamda function compared to a class member function,
  // otherwise it will leak async ops in `deno test`
  // Deno Version: 1.27.1
  private signalListener = () => {
    this.end();
    Deno.exit();
  };

  /**
   * Title, total, complete, incomplete, can also be set or changed in the render method
   *
   * - title Progress bar title, default: ''
   * - total total number of ticks to complete,
   * - width the displayed width of the progress, default: 50
   * - complete completion character, default: colors.bgGreen(' '), can use any string
   * - incomplete incomplete character, default: colors.bgWhite(' '), can use any string
   * - clear  clear the bar on completion, default: false
   * - interval  minimum time between updates in milliseconds, default: 16
   * - display  What is displayed and display order, default: ':title :percent :bar :time :completed/:total'
   * - prettyTime Whether to pretty print time and eta
   */
  constructor(
    {
      title = "",
      total,
      width = 50,
      complete = bgGreen(" "),
      preciseBar = [],
      incomplete = bgWhite(" "),
      clear = false,
      interval = 16,
      display,
      prettyTime = false,
    }: constructorOptions = {},
  ) {
    this.title = title;
    this.total = total;
    this.width = width;
    this.complete = complete;
    this.preciseBar = preciseBar.concat(complete);
    this.incomplete = incomplete;
    this.clear = clear;
    this.interval = interval;
    this.display = display ??
      ":title :percent :bar :time :completed/:total :text";
    this.prettyTime = prettyTime;
    Deno.addSignalListener("SIGINT", this.signalListener);
  }

  /**
   * "render" the progress bar
   *
   * - `completed` completed value
   * - `options` optional parameters
   *   - `title` progress bar title
   *   - `total` total number of ticks to complete
   *   - `text` optional, custom text, default: ''
   *   - `complete` completion character, If you want to change at a certain moment. For example, it turns red at 20%
   *   - `incomplete` incomplete character, If you want to change at a certain moment. For example, it turns red at 20%
   *   - `prettyTimeOptions` prettyTime options
   */
  render(completed: number, options: renderOptions = {}): void {
    if (this.isCompleted || !hasStdout) return;

    if (completed < 0) {
      throw new Error(`completed must greater than or equal to 0`);
    }

    const total = options.total ?? this.total ?? 100;
    const now = Date.now();
    const ms = now - this.lastRenderTime;
    if (ms < this.interval && completed < total) return;

    this.lastRenderTime = now;
    const time = this.prettyTime
      ? prettyTime(now - this.start, options.prettyTimeOptions)
      : ((now - this.start) / 1000).toFixed(1) + "s";
    const msEta = completed >= total
      ? 0
      : (total / completed - 1) * (now - this.start);
    const eta = completed == 0
      ? "-"
      : this.prettyTime
      ? prettyTime(msEta, options.prettyTimeOptions)
      : (msEta / 1000).toFixed(1) +
        "s";

    const percent = ((completed / total) * 100).toFixed(2) + "%";

    // :title :percent :bar :time :completed/:total
    let str = this.display
      .replace(":title", options.title ?? this.title)
      .replace(":time", time)
      .replace(":text", options.text ?? "")
      .replace(":eta", eta)
      .replace(":percent", percent)
      .replace(":completed", completed + "")
      .replace(":total", total + "");

    // compute the available space (non-zero) for the bar
    const availableSpace = Math.max(
      0,
      this.ttyColumns - stripAnsiCode(str.replace(":bar", "")).length,
    );

    const width = Math.min(this.width, availableSpace);
    const finished = completed >= total;

    const preciseBar = options.preciseBar ?? this.preciseBar;
    const precision = preciseBar.length > 1;

    // :bar
    const completeLength = width * completed / total;
    const roundedCompleteLength = Math.floor(completeLength);

    let precise = "";
    if (precision) {
      const preciseLength = completeLength - roundedCompleteLength;
      precise = finished
        ? ""
        : preciseBar[Math.floor(preciseBar.length * preciseLength)];
    }

    const complete = new Array(roundedCompleteLength).fill(
      options.complete ?? this.complete,
    ).join("");
    const incomplete = new Array(
      Math.max(width - roundedCompleteLength - (precision ? 1 : 0), 0),
    ).fill(options.incomplete ?? this.incomplete).join("");

    str = str.replace(":bar", complete + precise + incomplete);

    if (str !== this.lastStr) {
      const strLen = stripAnsiCode(str).length;
      if (strLen < this.lastStrLen) {
        str += " ".repeat(this.lastStrLen - strLen);
      }
      this.write(str);
      this.lastStr = str;
      this.lastStrLen = strLen;
    }

    if (finished) this.end();
  }

  /**
   * end: end a progress bar.
   * No need to call in most cases, unless you want to end before 100%
   */
  end(): void {
    Deno.removeSignalListener("SIGINT", this.signalListener);
    this.isCompleted = true;
    if (this.clear) {
      this.stdoutWrite("\r");
      this.clearLine();
    } else {
      this.breakLine();
    }
    this.showCursor();
  }

  /**
   * interrupt the progress bar and write a message above it
   *
   * @param message The message to write
   */
  console(message: string | number): void {
    this.clearLine();
    this.write(`${message}`);
    this.breakLine();
    this.write(this.lastStr);
  }

  private write(msg: string): void {
    msg = `\r${msg}\x1b[?25l`;
    this.stdoutWrite(msg);
  }

  private get ttyColumns(): number {
    if (!Deno.isatty(Deno.stdout.rid)) return 100;
    return Deno.consoleSize().columns;
  }

  private breakLine() {
    this.stdoutWrite("\n");
  }

  private stdoutWrite(msg: string) {
    writeAllSync(Deno.stdout, this.encoder.encode(msg));
  }

  private clearLine(direction: Direction = Direction.all): void {
    switch (direction) {
      case Direction.all:
        this.stdoutWrite("\x1b[2K");
        break;
      case Direction.left:
        this.stdoutWrite("\x1b[1K");
        break;
      case Direction.right:
        this.stdoutWrite("\x1b[0K");
        break;
    }
  }

  private showCursor(): void {
    this.stdoutWrite("\x1b[?25h");
  }
}
