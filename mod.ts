import {
  bgGreen,
  bgWhite,
} from "https://deno.land/std@0.50.0/fmt/colors.ts";

const isTTY = Deno.isatty(Deno.stdout.rid);

interface Options {
  title?: string,
  total?: number,
  width?: number,
  complete?: string,
  incomplete?: string,
  clear?: boolean,
  interval?: number,
  display?: string
}

const enum Direction {
  left,
  right,
  all
}

export default class ProgressBar {
  title: string;
  total?: number;
  width: number;
  complete: string;
  incomplete: string;
  clear: boolean;
  interval: number;
  display: string;

  private isCompleted = false;
  private lastStr = '';
  private start = Date.now();
  private time?: string;
  private lastRender = 0;
  private encoder = new TextEncoder();

  /**
   * @param title Progress bar title, default: ''
   * @param total total number of ticks to complete, Can also be set within the render method
   * @param width the displayed width of the progress, default: 50
   * @param complete completion character, default: colors.bgGreen(' '), can use any string
   * @param incomplete incomplete character, default: colors.bgWhite(' '), can use any string
   * @param clear  clear the bar on completion, default: false
   * @param interval  minimum time between updates in milliseconds, default: 16
   * @param display  What is displayed and display order, default: ':title :percent :bar :time :completed/:total'
   */
  constructor({ title = '', total, width = 50, complete = bgGreen(' '), incomplete = bgWhite(' '), clear = false, interval, display }: Options = {}) {
    this.title = title;
    this.total = total;
    this.width = width;
    this.complete = complete;
    this.incomplete = incomplete;
    this.clear = clear;
    this.interval = interval || 16;
    this.display = display || ':title :percent :bar :time :completed/:total';
  }

  /**
   * "render" the progress bar with completed and optional `total`
   * 
   * @param completed Completed value
   * @param total total number of ticks to complete, Can also be set in the constructor
   */
  render(completed: number, total = this.total): void {
    if (!isTTY) return;

    completed = +completed;
    if (!Number.isInteger(completed)) throw new Error(`completed must be 'number'`);
    if (completed < 0) throw new Error(`completed must greater than or equal to 0`);

    if (total === undefined) throw new Error(`total required`);
    if (!Number.isInteger(total)) throw new Error(`total must be 'number'`);

    if (this.isCompleted) console.warn('Called after the end');

    const now = Date.now();
    const ms = now - this.lastRender;
    if (ms < this.interval! && completed < total) return;

    this.lastRender = now;
    this.time = ((now - this.start) / 1000).toFixed(1) + 's';

    const percent = ((completed / total) * 100).toFixed(2) + '%';

    // :title :percent :bar :time :completed/:total
    let str = this.display
      .replace(':title', this.title)
      .replace(':time', this.time)
      .replace(':percent', percent)
      .replace(':completed', completed + '')
      .replace(':total', total + '');

    // compute the available space (non-zero) for the bar
    let availableSpace = Math.max(0, this.ttyColumns - str.replace(':bar', '').length);
    if (availableSpace && Deno.build.os === 'windows') availableSpace -= 1;

    const width = Math.min(this.width, availableSpace);

    // :bar
    const completeLength = Math.round(width * completed / total);
    const complete = new Array(completeLength).fill(this.complete).join('');
    const incomplete = new Array(width - completeLength).fill(this.incomplete).join('');

    str = str.replace(':bar', complete + incomplete);

    if (this.lastStr !== str) {
      this.write(str);
      this.lastStr = str;
    }

    if (completed >= total) this.end();
  }
  
  /**
   * end: end a progress bar.
   * No need to call in most cases, unless you want to end before 100%
   */
  end(): void {
    this.isCompleted = true;
    if (this.clear) {
      this.stdoutWrite('\r');
      this.clearLine();
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
  };

  private write(msg: string): void {
    msg = `\r${msg}\x1b[?25l`;
    this.stdoutWrite(msg);
  }

  private get ttyColumns(): number {
    // to do
    return 100;
  }

  private breakLine() {
    this.stdoutWrite('\r\n');
  }

  private stdoutWrite(msg: string) {
    // Deno.stdout.writeSync(this.encoder.encode(msg));
    Deno.writeAllSync(Deno.stdout, this.encoder.encode(msg));
  }

  private clearLine(direction: Direction = Direction.all): void {
    switch (direction) {
      case Direction.all:
        this.stdoutWrite('\x1b[2K');
        break;
      case Direction.left:
        this.stdoutWrite('\x1b[1K');
        break;
      case Direction.right:
        this.stdoutWrite('\x1b[0K');
        break;
    }
  }

  private showCursor(): void {
    this.stdoutWrite('\x1b[?25h');
  }
}