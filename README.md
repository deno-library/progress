![logo](screenshots/logo.png)

Progress bar in terminal for deno

## Usage  
* simple example
```ts
import ProgressBar from "https://deno.land/x/progress@v1.1.0/mod.ts";

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
import ProgressBar from "https://deno.land/x/progress@v1.1.0/mod.ts";

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

<center>Standard use</center>

![normal](./screenshots/title.gif) 

<center>Change how the order and look of elements</center>

![console](./screenshots/display.gif)  

<center>Change character color</center>

![console](./screenshots/changeColor.gif)  

<center>Change background color</center>

![console](./screenshots/changeBgColor.gif)

<center>Color that changes with progress</center>

![console](./screenshots/colorProgression.gif)

<center>Precise bar with more intermediate states</center>

![console](./screenshots/preciseBar.gif)

<center>Wider bar</center>

![console](./screenshots/width.gif)

<center>Clear the bar once finished</center>
 
![clear](./screenshots/clear.gif) 

<center>Backward progress</center>

![backward](./screenshots/backward.gif)  

<center>Log some messages</center>

![console](./screenshots/console.gif) 

<center>Log some messages next to the bar</center>

![console](./screenshots/info.gif)  



More screenshots in the `screenshots` folder.

## to do
get tty columns
> waiting for Deno to support 'get tty columns'
```ts
  private get ttyColumns(): number {
    // to do
    return 100;
  }
```