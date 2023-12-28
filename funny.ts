import { bgGreen, bgWhite, stripAnsiCode } from "./deps.ts";
import { prettyTime, prettyTimeOptions } from "./time.ts";

const hasStdout = Deno.stdout;

interface constructorOptions {
  title?: string;
  total?: number;
  width?: number;
  complete?: string;
  incomplete?: string;
  clear?: boolean;
  interval?: number;
  display?: string;
  prettyTime?: boolean;
  vertical?: boolean;
}

interface renderOptions {
  title?: string;
  total?: number;
  text?: string;
  complete?: string;
  incomplete?: string;
  prettyTimeOptions?: prettyTimeOptions;
}

export class FunnyProgressBar {
  title: string;
  total?: number;
  width: number;
  complete: string;
  incomplete: string;
  clear: boolean;
  interval: number;
  display: string;
  prettyTime: boolean;
  vertical: boolean;

  #end = false;
  #lastRows = 0;
  #lines: string[] = [];
  private lastStr = "";
  private start = Date.now();
  private lastRenderTime = 0;
  private encoder = new TextEncoder();
  private writer = Deno.stdout.writable.getWriter();

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
   * - width the displayed width of the progress, default: 50
   * - complete completion character, default: colors.bgGreen(' '), can use any string
   * - incomplete incomplete character, default: colors.bgWhite(' '), can use any string
   * - clear  clear the bar on completion, default: false
   * - interval  minimum time between updates in milliseconds, default: 16
   * - display  What is displayed and display order, default: ':bar :text :percent :time :completed/:total'
   * - prettyTime Whether to pretty print time and eta
   */
  constructor(
    {
      title = "",
      total,
      width = 50,
      complete = bgGreen(" "),
      incomplete = bgWhite(" "),
      clear = false,
      interval,
      display,
      prettyTime = false,
      vertical = true,
    }: constructorOptions = {},
  ) {
    this.title = title;
    this.total = total;
    this.width = width;
    this.complete = complete;
    this.incomplete = incomplete;
    this.clear = clear;
    this.interval = interval ?? 16;
    this.display = display ?? ":title :bar :text :time :percent :completed/:total";
    this.prettyTime = prettyTime;
    this.vertical = vertical;
    Deno.addSignalListener("SIGINT", this.signalListener);
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
  render(completed: number, image: string, options: renderOptions = {}): void {
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
      : (msEta / 1000).toFixed(1) +
        "s";

    const percent = ((completed / total) * 100).toFixed(2) + "%";
    const lines = image.split("\n");
    if (this.vertical) {
      let index = 0;
      const whitespaceLen = lines.length - 1 -
        Math.floor(lines.length * completed / total);
      for (const line of lines) {
        const availableSpace = this.ttyColumns - stripAnsiCode(line).length;
        if (availableSpace < 2) return;
        const char = index < whitespaceLen ? this.incomplete : this.complete;
        this.#lines[index++] = line + " ".repeat(availableSpace - 2) + char +
          " ";
      }
      const str = this.display
        .replace(":bar", "")
        .replace(":title", options.title ?? this.title)
        .replace(":time", time)
        .replace(":text", options.text ?? "")
        .replace(":eta", eta)
        .replace(":percent", percent)
        .replace(":completed", completed + "")
        .replace(":total", total + "");
      this.#lines[lines.length - 1] =
        stripAnsiCode(this.#lines[lines.length - 1]).slice(
          0,
          -str.length - 1,
        ) + str + " ";
    } else {
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

      // :bar
      const completeLength = width * completed / total;
      const roundedCompleteLength = Math.floor(completeLength);

      const complete = new Array(roundedCompleteLength).fill(
        options.complete ?? this.complete,
      ).join("");
      const incomplete = new Array(
        Math.max(width - roundedCompleteLength, 0),
      ).fill(options.incomplete ?? this.incomplete).join("");

      str = str.replace(":bar", complete + incomplete);
      lines.push(str);
      this.#lines=lines
    }

    const renderStr = this.#lines.join("\n");

    if (renderStr !== this.lastStr) {
      this.resetScreen();
      this.write(renderStr);
      this.lastStr = renderStr;
      this.#lastRows = this.#lines.length;
    }

    if (end) this.end();
  }

  /**
   * end: end a progress bar.
   * No need to call in most cases, unless you want to end before 100%
   */
  end(): void {
    Deno.removeSignalListener("SIGINT", this.signalListener);
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
    if (!Deno.isatty(Deno.stdout.rid)) return 100;
    return Deno.consoleSize().columns;
  }

  private breakLine() {
    this.stdoutWrite("\n");
  }

  private stdoutWrite(msg: string) {
    this.writer.write(this.encoder.encode(msg));
  }

  private showCursor(): void {
    this.stdoutWrite("\x1b[?25h");
  }
}
