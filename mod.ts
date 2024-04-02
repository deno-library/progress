import { bgGreen, bgWhite, stripAnsiCode } from "./deps.ts";
import { prettyTime, type prettyTimeOptions } from "./time.ts";
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

/**
 * ProgressBar single progress bar.
 */
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

  #end = false;
  private lastStr = "";
  private lastStrLen = 0;
  private start = Date.now();
  private lastRenderTime = 0;
  private encoder = new TextEncoder();
  private writer = Deno.stdout.writable.getWriter();

  // Deno Version 1.39.1 no longer reports errors
  // Note from @bjesuiter: This MUST be a Lamda function compared to a class member function,
  // otherwise it will leak async ops in `deno test`
  // Deno Version: 1.27.1
  // private signalListener = () => {
  //   this.end();
  //   Deno.exit();
  // };

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
  constructor({
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
  }: constructorOptions = {}) {
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
    // Deno.addSignalListener("SIGINT", this.signalListener);
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
  async render(completed: number, options: renderOptions = {}): Promise<void> {
    if (this.#end || !hasStdout) return;

    if (completed < 0) {
      throw new Error(`completed must greater than or equal to 0`);
    }

    const total = options.total ?? this.total ?? 100;
    const now = Date.now();
    const ms = now - this.lastRenderTime;
    const end = completed >= total;
    if (ms < this.interval && !end) return;

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
      : (msEta / 1000).toFixed(1) + "s";

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

    const preciseBar = options.preciseBar ?? this.preciseBar;
    const precision = preciseBar.length > 1;

    // :bar
    const completeLength = (width * completed) / total;
    const roundedCompleteLength = Math.floor(completeLength);

    let precise = "";
    if (precision) {
      const preciseLength = completeLength - roundedCompleteLength;
      precise = end
        ? ""
        : preciseBar[Math.floor(preciseBar.length * preciseLength)];
    }

    const complete = new Array(roundedCompleteLength)
      .fill(options.complete ?? this.complete)
      .join("");
    const incomplete = new Array(
      Math.max(width - roundedCompleteLength - (precision ? 1 : 0), 0),
    )
      .fill(options.incomplete ?? this.incomplete)
      .join("");

    str = str.replace(":bar", complete + precise + incomplete);

    if (str !== this.lastStr) {
      const strLen = stripAnsiCode(str).length;
      if (strLen < this.lastStrLen) {
        str += " ".repeat(this.lastStrLen - strLen);
      }
      await this.write(str);
      this.lastStr = str;
      this.lastStrLen = strLen;
    }

    if (end) await this.end();
  }

  /**
   * end: end a progress bar.
   * No need to call in most cases, unless you want to end before 100%
   */
  async end(): Promise<void> {
    // Deno.removeSignalListener("SIGINT", this.signalListener);
    if (this.#end) return;
    this.#end = true;
    if (this.clear) {
      await this.stdoutWrite("\r");
      await this.clearLine();
    } else {
      await this.breakLine();
    }
    await this.showCursor();
    this.writer.releaseLock();
  }

  /**
   * interrupt the progress bar and write a message above it
   *
   * @param message The message to write
   */
  async console(message: string | number): Promise<void> {
    await this.clearLine();
    await this.write(`${message}`);
    await this.breakLine();
    await this.write(this.lastStr);
  }

  private write(msg: string): Promise<void> {
    return this.stdoutWrite(`\r${msg}\x1b[?25l`);
  }

  private get ttyColumns(): number {
    if (!Deno.stdout.isTerminal()) return 100;
    return Deno.consoleSize().columns;
  }

  private breakLine(): Promise<void> {
    return this.stdoutWrite("\n");
  }

  private stdoutWrite(msg: string): Promise<void> {
    return this.writer.write(this.encoder.encode(msg));
  }

  private clearLine(direction: Direction = Direction.all): Promise<void> {
    switch (direction) {
      case Direction.all:
        return this.stdoutWrite("\x1b[2K");
      // break;
      case Direction.left:
        return this.stdoutWrite("\x1b[1K");
      // break;
      case Direction.right:
        return this.stdoutWrite("\x1b[0K");
        // break;
    }
  }

  private showCursor(): Promise<void> {
    return this.stdoutWrite("\x1b[?25h");
  }
}
