import { prettyTime } from "../time.ts";
import { assertEquals } from "@std/assert";

Deno.test(`test prettyTime: default`, () => {
  // assertEquals(prettyTime(10), "10.0s");
  const base = 111;
  assertEquals(prettyTime(base), "0.1s");
  assertEquals(prettyTime(10 * base), "1.1s");
  assertEquals(prettyTime(100 * base), "11.1s");
  assertEquals(prettyTime(1000 * base), "1m51.0s");
  assertEquals(prettyTime(10000 * base), "18m30.0s");
  assertEquals(prettyTime(100000 * base), "3h5m0.0s");
  assertEquals(prettyTime(1000000 * base), "1d6h50m0.0s");
});

Deno.test(`test prettyTime: withSpaces`, () => {
  // assertEquals(prettyTime(10), "10.0s");
  const base = 111;
  assertEquals(prettyTime(base, { withSpaces: true }), "0.1s");
  assertEquals(prettyTime(10 * base, { withSpaces: true }), "1.1s");
  assertEquals(prettyTime(100 * base, { withSpaces: true }), "11.1s");
  assertEquals(prettyTime(1000 * base, { withSpaces: true }), "1m 51.0s");
  assertEquals(prettyTime(10000 * base, { withSpaces: true }), "18m 30.0s");
  assertEquals(prettyTime(100000 * base, { withSpaces: true }), "3h 5m 0.0s");
  assertEquals(
    prettyTime(1000000 * base, { withSpaces: true }),
    "1d 6h 50m 0.0s",
  );
});

Deno.test(`test prettyTime: toFixedVal`, () => {
  // assertEquals(prettyTime(10), "10.0s");
  const base = 111;
  assertEquals(prettyTime(base, { toFixedVal: 0 }), "0s");
  assertEquals(prettyTime(10 * base, { toFixedVal: 0 }), "1s");
  assertEquals(prettyTime(100 * base, { toFixedVal: 0 }), "11s");
  assertEquals(prettyTime(1000 * base, { toFixedVal: 0 }), "1m51s");
  assertEquals(prettyTime(10000 * base, { toFixedVal: 0 }), "18m30s");
  assertEquals(prettyTime(100000 * base, { toFixedVal: 0 }), "3h5m0s");
  assertEquals(prettyTime(1000000 * base, { toFixedVal: 0 }), "1d6h50m0s");
});

Deno.test(`test prettyTime: longFormat`, () => {
  // assertEquals(prettyTime(10), "10.0s");
  const base = 111;
  assertEquals(prettyTime(base, { longFormat: true }), "0.1second");
  assertEquals(prettyTime(10 * base, { longFormat: true }), "1.1seconds");
  assertEquals(prettyTime(100 * base, { longFormat: true }), "11.1seconds");
  assertEquals(
    prettyTime(1000 * base, { longFormat: true }),
    "1minute51.0seconds",
  );
  assertEquals(
    prettyTime(10000 * base, { longFormat: true }),
    "18minutes30.0seconds",
  );
  assertEquals(
    prettyTime(100000 * base, { longFormat: true }),
    "3hours5minutes0.0second",
  );
  assertEquals(
    prettyTime(1000000 * base, { longFormat: true }),
    "1day6hours50minutes0.0second",
  );
  assertEquals(
    prettyTime(10000000 * base, { longFormat: true }),
    "12days20hours20minutes0.0second",
  );
});

Deno.test(`test prettyTime: withSpaces and toFixedVal`, () => {
  // assertEquals(prettyTime(10), "10.0s");
  const base = 111;
  assertEquals(
    prettyTime(base, { withSpaces: true, toFixedVal: 0 }),
    "0s",
  );
  assertEquals(
    prettyTime(10 * base, { withSpaces: true, toFixedVal: 0 }),
    "1s",
  );
  assertEquals(
    prettyTime(100 * base, { withSpaces: true, toFixedVal: 0 }),
    "11s",
  );
  assertEquals(
    prettyTime(1000 * base, {
      withSpaces: true,
      toFixedVal: 0,
    }),
    "1m 51s",
  );
  assertEquals(
    prettyTime(10000 * base, {
      withSpaces: true,
      toFixedVal: 0,
    }),
    "18m 30s",
  );
  assertEquals(
    prettyTime(100000 * base, {
      withSpaces: true,
      toFixedVal: 0,
    }),
    "3h 5m 0s",
  );
  assertEquals(
    prettyTime(1000000 * base, {
      withSpaces: true,
      toFixedVal: 0,
    }),
    "1d 6h 50m 0s",
  );
  assertEquals(
    prettyTime(10000000 * base, {
      withSpaces: true,
      toFixedVal: 0,
    }),
    "12d 20h 20m 0s",
  );
});

Deno.test(`test prettyTime: withSpaces and toFixedVal and longFormat`, () => {
  // assertEquals(prettyTime(10), "10.0s");
  const base = 111;
  assertEquals(
    prettyTime(base, {
      longFormat: true,
      withSpaces: true,
      toFixedVal: 0,
    }),
    "0second",
  );
  assertEquals(
    prettyTime(10 * base, {
      longFormat: true,
      withSpaces: true,
      toFixedVal: 0,
    }),
    "1second",
  );
  assertEquals(
    prettyTime(100 * base, {
      longFormat: true,
      withSpaces: true,
      toFixedVal: 0,
    }),
    "11seconds",
  );
  assertEquals(
    prettyTime(1000 * base, {
      longFormat: true,
      withSpaces: true,
      toFixedVal: 0,
    }),
    "1minute 51seconds",
  );
  assertEquals(
    prettyTime(10000 * base, {
      longFormat: true,
      withSpaces: true,
      toFixedVal: 0,
    }),
    "18minutes 30seconds",
  );
  assertEquals(
    prettyTime(100000 * base, {
      longFormat: true,
      withSpaces: true,
      toFixedVal: 0,
    }),
    "3hours 5minutes 0second",
  );
  assertEquals(
    prettyTime(1000000 * base, {
      longFormat: true,
      withSpaces: true,
      toFixedVal: 0,
    }),
    "1day 6hours 50minutes 0second",
  );
  assertEquals(
    prettyTime(10000000 * base, {
      longFormat: true,
      withSpaces: true,
      toFixedVal: 0,
    }),
    "12days 20hours 20minutes 0second",
  );
});
