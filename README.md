# ProgressBar
ProgressBar in terminal for deno

## Useage  
* simple example
```ts
import ProgressBar from '../mod.ts'

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
import ProgressBar from '../mod.ts'

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
  incomplete?: string,
  clear?: boolean,
  interval?: number,
  display?: string
}

interface ProgressBar {
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
  constructor(optopns: ConstructorOptions): void;

  /**
   * render: render the progress bar
   * 
   * @param completed Completed value
   * @param total total number of ticks to complete, can also be set in the constructor
   */
  render(completed: number, total? number): void;

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

normal  
![normal](./screenshots/normal.gif)  

clear  
![clear](./screenshots/clear.gif) 

backword 
![backword](./screenshots/backword.gif)  

console 
![console](./screenshots/console.gif)  

More screenshots in the `screenshots` folder.

## to do
get tty columns
```ts
  private get ttyColumns(): number {
    // to do
    return 100;
  }
```