import { Point } from "./type.ts";
import { ROW_NUM, COL_NUM } from "./constant.ts";

export function castExists<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Unexpected undefined");
  }
  return value;
}

export function assert(value: boolean, assertMessage: string) {
  if (!value) {
    throw new Error(`Assertion failed: ${assertMessage}`);
  }
}

export function comparePoint(p: Point, p2: Point): number {
  if (p.r !== p2.r) {
    return Math.sign(p.r - p2.r);
  }
  return Math.sign(p.c - p2.c);
}

export function inBoard({ r, c }: Point): boolean {
  return 0 <= r && r < ROW_NUM && 0 <= c && c < COL_NUM;
}

export function flatIterable<T>(iter: Iterable<T>): Array<T> {
  const ret = [];
  for (const v of iter) {
    ret.push(v);
  }
  return ret;
}
