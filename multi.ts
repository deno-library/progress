import { bgGreen, bgWhite, writeAllSync } from "./deps.ts";

const IS_TTY = Deno.stdout && Deno.isatty(Deno.stdout.rid);
const IS_WINDOWS = Deno.build.os === "windows";

interface constructorOptions {
  title?: string;
  width?: number;
  barWidth?: number;
  maxWidth?: number;
  complete?: string;
  incomplete?: string;
  clear?: boolean;
  interval?: number;
  display?: string;
}

interface renderOptions {
  completed: number;
  text?: string;
  total?: number;
  complete?: string;
  incomplete?: string;
}

export class MultiProgressBar {
  width?: number;
  barWidth: number;
  maxWidth?: number;
  complete: string;
  incomplete: string;
  clear: boolean;
  interval: number;
  display: string;

  #end = false;
  #startIndex = 0;
  #lastRows = 0;
  #strs: string[] = [];
  private lastStr = "";
  private start = Date.now();
  private lastRender = 0;
  private encoder = new TextEncoder();

  /**
   * Title, total, complete, incomplete, can also be set or changed in the render method
   *
   * @param title Progress bar title, default: ''
   * @param width deprecated in favor of barWidth; the displayed width of the progress, default: 50
   * @param barWidth new prop to replace width; the displayed width of the progress, default: 50
   * @param maxWidth maximum with of bar + text
   * @param complete completion character, default: colors.bgGreen(' '), can use any string
   * @param incomplete incomplete character, default: colors.bgWhite(' '), can use any string
   * @param clear  clear the bar on completion, default: false
   * @param interval  minimum time between updates in milliseconds, default: 16
   * @param display  What is displayed and display order, default: ':bar :text :percent :time :completed/:total'
   */
  constructor(
    {
      title = "",
      width = 50,
      barWidth = 50,
      maxWidth,
      complete = bgGreen(" "),
      incomplete = bgWhite(" "),
      clear = false,
      interval,
      display,
    }: constructorOptions = {},
  ) {
    if (title != "") {
      this.#strs.push(title);
      this.#startIndex = 1;
    }
    this.complete = complete;
    this.incomplete = incomplete;
    this.clear = clear;
    this.interval = interval ?? 16;
    this.display = display ?? ":bar :text :percent :time :completed/:total";
    
    this.maxWidth = maxWidth;
    if (barWidth === 50 && !!width && width !== 50) {
      this.barWidth = width;
    } else {
      this.barWidth = barWidth;
    }
    this.barWidth = Math.min(this.ttyColumns, this.barWidth);
    // this.console(`this.tty: ${this.ttyColumns}, this.barWidth: ${this.barWidth}`);

    Deno.addSignalListener("SIGINT", () => {
      // console.log("\r\ninterrupted!");
      this.end();
      Deno.exit();
    });
  }

  /**
   * "render" the progress bar
   *
   * - `bars` progress bars
   *   - `completed` completed value
   *   - `total` optional, total number of ticks to complete, default: 100
   *   - `text` optional, text displayed per ProgressBar, default: ''
   *   - `complete` - optional, completion character
   *   - `incomplete` - optional, incomplete character
   */
  render(bars: Array<renderOptions>): void {
    if (this.#end || !IS_TTY) return;

    const now = Date.now();
    const ms = now - this.lastRender;
    this.lastRender = now;
    const time = ((now - this.start) / 1000).toFixed(1) + "s";
    const formattedTime = this.#timeFormatted(now - this.start);
    let end = true;
    let index = this.#startIndex;

    for (const { completed, total = 100, text = "", ...options } of bars) {
      if (completed < 0) {
        throw new Error("completed must greater than or equal to 0");
      }
      if (!Number.isInteger(total)) throw new Error("total must be 'number'");

      if (completed > total && this.#strs[index] != undefined) continue;

      end = false;
      const percent = ((completed / total) * 100).toFixed(2) + "%";
      const eta = completed == 0
        ? "-"
        : ((completed >= total)
          ? 0
          : (total / completed - 1) * (now - this.start) / 1000).toFixed(1) +
          "s";

      // :bar :text :percent :formattedTime :time :eta :completed/:total
      let str = this.display
        .replace(":text", text)
        .replace(":formattedTime", formattedTime)
        .replace(":time", time)
        .replace(":eta", eta)
        .replace(":percent", percent)
        .replace(":completed", completed + "")
        .replace(":total", total + "");

      // compute the available space (non-zero) for the bar
      let availableSpace = Math.max(
        0,
        this.ttyColumns - str.replace(":bar", "").length,
      );
      if (availableSpace && IS_WINDOWS) availableSpace -= 1;
      const width = Math.min(this.barWidth, availableSpace);

      // :bar
      const completeLength = Math.round(width * completed / total);
      const complete = new Array(completeLength).fill(
        options.complete ?? this.complete,
      ).join("");
      const incomplete = new Array(width - completeLength).fill(
        options.incomplete ?? this.incomplete,
      ).join("");

      str = str.replace(":bar", complete + incomplete);

      // add spaces to cover up characters render from previous render
      str += " ".repeat(this.ttyColumns);
    // barDiff counts control characters to render the color of the bar
      const barDiff = (complete.length + incomplete.length) - width;
    // clips the bar + text at displayable width
      this.#strs[index++] = str.substring(0, this.ttyColumns + barDiff);
    }
    if (ms < this.interval && end == false) return;
    const renderStr = this.#strs.join("\r\n");

    if (renderStr !== this.lastStr) {
      this.resetScreen();
      this.write(renderStr);
      this.lastStr = renderStr;
      this.#lastRows = this.#strs.length;
    }

    if (end) this.end();
  }

  /**
   * end: end a progress bar.
   * No need to call in most cases, unless you want to end before 100%
   */
  end(): void {
    this.#end = true;
    if (this.clear) {
      this.resetScreen();
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
    this.resetScreen();
    this.write(`${message}`);
    this.breakLine();
    this.write(this.lastStr);
  }

  private write(msg: string): void {
    msg = `${msg}\x1b[?25l`;
    this.stdoutWrite(msg);
  }

  private resetScreen() {
    if (this.#lastRows > 0) {
      this.stdoutWrite("\x1b[" + (this.#lastRows - 1) + "A\r\x1b[?0J");
    }
  }

  private get ttyColumns(): number {
    let numColumns = 100;

    // by wrapping the call with try-catch block, we add the support for unstable consoleSize to MultiProgressBar
    try {
      numColumns = Deno.consoleSize(Deno.stdout.rid).columns;
    } catch {
      //
    }

    if (this.maxWidth) {
      numColumns = Math.min(numColumns, this.maxWidth);
    }

    return numColumns;
  }

  private breakLine() {
    this.stdoutWrite("\r\n");
  }

  private stdoutWrite(msg: string) {
    writeAllSync(Deno.stdout, this.encoder.encode(msg));
  }

  private showCursor(): void {
    this.stdoutWrite("\x1b[?25h");
  }

  #timeFormatted(ms: number): string {
    let formatted = '';

    if (ms < 1_000) {
      formatted = `${ms}ms`;
    } else if (ms < 60 * 1_000) {
      formatted = `${(ms / 1000).toFixed(1)}s`;
    } else if (ms < 60 * 60 * 1_000) {
      const minutes = Math.floor(ms / 60 / 1_000);
      const remainderMs = ms - (minutes * 60 * 1_000);
      formatted = `${minutes}:${(remainderMs / 1000).toFixed(1).padStart(4, '0')}s`;
    } else if (ms < 24 * 60 * 60 * 1_000) {
      const hours = Math.floor(ms / 60 / 60 / 1_000);
      let remainderMs = ms - (hours * 60 * 60 * 1_000);
      const minutes = Math.floor(remainderMs / 60 / 1_000);
      remainderMs -= (minutes * 60 * 1_000);
      formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${(remainderMs / 1000).toFixed(1).padStart(4, '0')}s`;
    } else {
      const days = Math.floor(ms / 24 / 60 / 60 / 1_000);
      let remainderMs = ms - (days * 24 * 60 * 60 * 1_000);
      const hours = Math.floor(ms / 60 / 60 / 1_000);
      remainderMs -= (hours * 60 * 60 * 1_000);
      const minutes = Math.floor(remainderMs / 60 / 1_000);
      remainderMs -= (minutes * 60 * 1_000);
      formatted = `${days} days ${hours}:${minutes.toString().padStart(2, '0')}:${(remainderMs / 1000).toFixed(1).padStart(4, '0')}s`;
    }

    return formatted;
  }
}
