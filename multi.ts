import { bgGreen, bgWhite, stripAnsiCode } from "./deps.ts";
import { prettyTime, prettyTimeOptions } from "./time.ts";

const hasStdout = Deno.stdout;

interface constructorOptions {
  title?: string;
  width?: number;
  complete?: string;
  incomplete?: string;
  clear?: boolean;
  interval?: number;
  display?: string;
  prettyTime?: boolean;
}

interface renderOptions {
  completed: number;
  text?: string;
  total?: number;
  complete?: string;
  incomplete?: string;
  prettyTimeOptions?: prettyTimeOptions;
}

interface bar {
  str: string;
  strLen?: number;
  end?: boolean;
}

export class MultiProgressBar {
  width: number;
  complete: string;
  incomplete: string;
  clear: boolean;
  interval: number;
  display: string;
  prettyTime: boolean;

  #end = false;
  #startIndex = 0;
  #lastRows = 0;
  #bars: bar[] = [];
  private lastStr = "";
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
   * - width the displayed width of the progress, default: 50
   * - complete completion character, default: colors.bgGreen(' '), can use any string
   * - incomplete incomplete character, default: colors.bgWhite(' '), can use any string
   * - clear  clear the bar on completion, default: false
   * - interval  minimum time between updates in milliseconds, default: 16
   * - display  What is displayed and display order, default: ':bar :text :percent :time :completed/:total'
   * - prettyTime Whether to pretty print time and eta
   */
  constructor({
    title = "",
    width = 50,
    complete = bgGreen(" "),
    incomplete = bgWhite(" "),
    clear = false,
    interval,
    display,
    prettyTime = false,
  }: constructorOptions = {}) {
    if (title != "") {
      this.#bars.push({ str: title });
      this.#startIndex = 1;
    }
    this.width = width;
    this.complete = complete;
    this.incomplete = incomplete;
    this.clear = clear;
    this.interval = interval ?? 16;
    this.display = display ?? ":bar :text :percent :time :completed/:total";
    this.prettyTime = prettyTime;
    // Deno.addSignalListener("SIGINT", this.signalListener);
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
   *   - `prettyTimeOptions` - prettyTime options
   */
  async render(bars: Array<renderOptions>): Promise<void> {
    if (this.#end || !hasStdout) return;

    const now = Date.now();
    const ms = now - this.lastRenderTime;
    this.lastRenderTime = now;
    let end = true;
    let index = this.#startIndex;

    for (const { completed, total = 100, text = "", ...options } of bars) {
      if (completed < 0) {
        throw new Error(`completed must greater than or equal to 0`);
      }
      if (!Number.isInteger(total)) throw new Error(`total must be 'number'`);
      if (this.#bars[index] && this.#bars[index].end) {
        index++;
        continue;
      }
      end = false;
      const percent = ((completed / total) * 100).toFixed(2) + "%";
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

      // :bar :text :percent :time :completed/:total
      let str = this.display
        .replace(":text", text)
        .replace(":time", time)
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
      // :bar
      const completeLength = Math.round((width * completed) / total);
      const complete = new Array(completeLength)
        .fill(options.complete ?? this.complete)
        .join("");
      const incomplete = new Array(width - completeLength)
        .fill(options.incomplete ?? this.incomplete)
        .join("");

      str = str.replace(":bar", complete + incomplete);
      const strLen = stripAnsiCode(str).length;
      if (this.#bars[index] && str != this.#bars[index].str) {
        const lastStrLen = this.#bars[index].strLen!;
        if (strLen < lastStrLen) {
          str += " ".repeat(lastStrLen - strLen);
        }
      }

      this.#bars[index++] = {
        str,
        strLen,
        end: completed >= total,
      };
    }
    if (ms < this.interval && !end) return;
    const str = this.#bars.map((v) => v.str).join("\n");

    if (str !== this.lastStr) {
      await this.resetScreen();
      await this.write(str);
      this.lastStr = str;
      this.#lastRows = this.#bars.length;
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
      await this.resetScreen();
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
    await this.resetScreen();
    await this.write(`${message}`);
    await this.breakLine();
    await this.write(this.lastStr);
  }

  private write(msg: string): Promise<void> {
    return this.stdoutWrite(`${msg}\x1b[?25l`);
  }

  private async resetScreen(): Promise<void> {
    if (this.#lastRows > 0) {
      await this.stdoutWrite("\x1b[" + (this.#lastRows - 1) + "A\r\x1b[?0J");
    }
  }

  private get ttyColumns(): number {
    if (!Deno.isatty(Deno.stdout.rid)) return 100;
    return Deno.consoleSize().columns;
  }

  private breakLine(): Promise<void> {
    return this.stdoutWrite("\n");
  }

  private stdoutWrite(msg: string): Promise<void> {
    return this.writer.write(this.encoder.encode(msg));
  }

  private showCursor(): Promise<void> {
    return this.stdoutWrite("\x1b[?25h");
  }
}
