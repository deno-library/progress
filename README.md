![logo](screenshots/logo.png)

<p align="center">
  Progress bar in terminal for deno
</p>

[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/progress)  

## Update  

### v1.1.1 - 2020.07.15  
changes: add mod.unstable.ts and ./exmaples/width.unstable.ts  
> Deno v1.2.0 started to support tty column, but is unstable
```bash
deno run --unstable ./examples/width.unstable.ts
```

## Usage  
* simple example
```ts
import ProgressBar from "https://deno.land/x/progress@v1.1.4/mod.ts";

const title = 'downloading:';
const total = 100;
const progress = new ProgressBar({
  title, 
  total
});
let completed = 0;
function downloading() {
  if (completed <= total) {
    progress.render(completed++);

    setTimeout(function (){
      downloading();
    }, 100)
  }
}
downloading();
```  
* complex example
```ts
import ProgressBar from "https://deno.land/x/progress@v1.1.4/mod.ts";

const total = 100;
const progress = new ProgressBar({
  total,
  complete: '=',
  incomplete: '-',
  display: ':completed/:total hello :time [:bar] :percent'
  // or => 
  // display: ':bar'
  // display: ':bar :time'
  // display: '[:bar]'
  // display: 'hello :bar world'
  // ...
});
let completed = 0;
function run() {
  if (completed <= total) {
    progress.render(completed++);

    setTimeout(function () {
      run();
    }, 100)
  }
}
run();
```
More examples in the `examples` folder.

## interface
```ts
interface ConstructorOptions {
  title?: string,
  total?: number,
  width?: number,
  complete?: string,
  preciseBar?: string[],
  incomplete?: string,
  clear?: boolean,
  interval?: number,
  display?: string
}

interface renderOptions {
  title?: string,
  total?: number,
  complete?: string,
  preciseBar?: string[],
  incomplete?: string,
}

interface ProgressBar {
  /**  
   * Title, total, complete, incomplete, can also be set or changed in the render method 
   * 
   * @param title Progress bar title, default: ''
   * @param total total number of ticks to complete
   * @param width the displayed width of the progress, default: 50
   * @param complete completion character, default: colors.bgGreen(' '), can use any string
   * @param preciseBar in between character, default: [colors.bgGreen(' ')], can use any string array
   * @param incomplete incomplete character, default: colors.bgWhite(' '), can use any string
   * @param clear  clear the bar on completion, default: false
   * @param interval  minimum time between updates in milliseconds, default: 16
   * @param display  What is displayed and display order, default: ':title :percent :bar :time :completed/:total'
   */
  constructor(optopns: ConstructorOptions): void;

  /**
   * render: render the progress bar
   * 
   * @param completed Completed value
   * @param options Optional parameters
   * @param options.title Progress bar title
   * @param options.total Progress bar total
   * @param options.complete completion character, If you want to change at a certain moment. For example, it turns red at 20%
   * @param options.incomplete incomplete character, If you want to change at a certain moment. For example, it turns red at 20%
   */
  render(completed: number, options? renderOptions): void;

  /**
   * console: interrupt the progress bar and write a message above it
   * 
   * @param message The message to write
   */
  console(message: string): void;

  /**
   * end: end a progress bar.
   * No need to call in most cases, unless you want to end before 100%
   */
  end(): void;
}
```  

## Screenshots

Standard use

![normal](./screenshots/title.gif) 

Change how the order and look of elements

![console](./screenshots/display.gif)  

Change character color

![console](./screenshots/changeColor.gif)  

Change background color

![console](./screenshots/changeBgColor.gif)

Color that changes with progress

![console](./screenshots/colorProgression.gif)

Precise bar with more intermediate states

![console](./screenshots/preciseBar.gif)

Wider bar

![console](./screenshots/width.gif)

Clear the bar once finished
 
![clear](./screenshots/clear.gif) 

Backward progress

![backward](./screenshots/backward.gif)  

Log some messages

![console](./screenshots/console.gif) 

Log some messages next to the bar

![console](./screenshots/info.gif)  

More screenshots in the `screenshots` folder.
