## Changelog

### v1.4.6 - 2024.03.27

[support JSR](https://github.com/deno-library/progress/issues/28)

### v1.4.5 - 2024.01.26

fix: [#26](https://github.com/deno-library/progress/issues/26)

### v1.4.4 - 2024.01.05

fix: The stream is already locked

### v1.4.3 - 2024.01.04

fix: The stream is already locked

### v1.4.2 - 2024.01.04

remove `addSignalListener`: Deno Version 1.39.1, `deno test` no longer reports errors

### v1.4.1 - 2023.12.27

Remove deprecated `writeAllSync`, Use `WritableStream` instead.

### v1.4.0 - 2023.11.12

update to use [deno standard library v0.206.0](https://deno.land/std@0.206.0)

### v1.3.9 - 2023.08.31

fixed [Incorrect bar size when color is used in the title](https://github.com/deno-library/progress/issues/24)

### v1.3.0 - 2022.11.7

changes:

1. fixed [colored string length calculation bug](https://github.com/deno-library/progress/issues/8)

2.  **Deno.consoleSize is now stable**

> [Deno v1.27.0 : Stabilize Deno.consoleSize() API](https://github.com/denoland/deno/pull/15933)

The Deno.consoleSize API change

```diff
- Deno.consoleSize(Deno.stdout.rid).columns;
+ Deno.consoleSize().columns;
```

Now you can run a wider bar without unstable.

```diff
- deno run --unstable ./examples/width.unstable.ts
+ deno run ./examples/width.ts
```

So `mod.unstable.ts` and `exmaples/width.unstable.ts` was removed.

```diff
- mod.unstable.ts
- exmaples/width.unstable.ts
```

### v1.2.9 - 2022.11.7

[Make this lib useable in deno tests](https://github.com/deno-library/progress/issues/13).

### v1.2.6 - 2022.5.30

[Add option to show ETA](https://github.com/deno-library/progress/issues/9).

### v1.2.0 - 2020.12.5

Add support for "Render multiple progress bars"\
[Thanks "shixiaobao17145" for the great idea](https://github.com/deno-library/progress/issues/7).

### v1.1.1 - 2020.07.15

changes: add mod.unstable.ts and ./exmaples/width.unstable.ts

> Deno v1.2.0 started to support tty column, but is unstable

```bash
deno run --unstable ./examples/width.unstable.ts
```
