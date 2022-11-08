/**
 * prettyTime options
 * @param withSpaces Whether to use spaces to separate times, `1d2h3m5s` or `1d 2h 3m 5s`, default false
 * @param toFixedVal value pass to toFixed for seconds, default 1
 * @param longFormat Whether to use a long format, default false, `1d2h3m5s` or `1days 2hours 3minutes 5seconds`
 */
export interface prettyTimeOptions {
  withSpaces?: boolean;
  toFixedVal?: number;
  longFormat?: boolean;
}

/**
 * Convert time duration to a human readable string: 5d1h20m30s
 *
 * @param seconds The number to format, unit milliseconds
 */
export function prettyTime(milliseconds: number, options: prettyTimeOptions = {
  withSpaces: false,
  toFixedVal: 1,
  longFormat: false,
}): string {
  let second = milliseconds / 1000;
  if (second < 60) {
    return unitToString(second, 0, options);
  }
  let minute = Math.floor(second / 60);
  second %= 60;
  if (minute < 60) {
    return unitToString(minute, 1, options) + unitToString(second, 0, options);
  }
  let hour = Math.floor(minute / 60);
  minute %= 60;
  if (hour < 24) {
    return unitToString(hour, 2, options) + unitToString(minute, 1, options) +
      unitToString(second, 0, options);
  }
  const day = Math.floor(hour / 24);
  hour %= 24;
  return unitToString(day, 3, options) + unitToString(hour, 2, options) +
    unitToString(minute, 1, options) +
    unitToString(second, 0, options);
}

function unitToString(
  val: number,
  i: number,
  { withSpaces = false, toFixedVal = 1, longFormat = false }: prettyTimeOptions,
): string {
  const units = longFormat
    ? ["second", "minute", "hour", "day"]
    : ["s", "m", "h", "d"];
  const unit = longFormat && (val >= 2 || (val > 1 && toFixedVal > 0))
    ? units[i] + "s"
    : units[i];
  if (i == 0) {
    return val.toFixed(toFixedVal) + unit;
  }
  return val + (withSpaces ? unit + " " : unit);
}
