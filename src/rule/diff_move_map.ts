import { Point } from "src/common/type.ts";
import { Board, Koma } from "./type.ts";
import { castExists } from "src/common/util.ts";
import { ROW_NUM, COL_NUM } from "src/common/constant.ts";

export enum Token {
  /** Empty. */
  E = "E",
  /** Destination. */
  D = "D",
  /** Source. */
  S = "S",
}

export type DiffMoveMap = Array<Token[]>;

function findToken(mp: DiffMoveMap, token: Token): Point | undefined {
  for (let r = 0; r < mp.length; r++) {
    for (let c = 0; c < mp[r].length; c++) {
      if (mp[r][c] === token) return { r, c };
    }
  }
  return undefined;
}

export type DiffMoveList = Point[];

export function diffMoveFromMap(mp: DiffMoveMap): DiffMoveList {
  const source = castExists(findToken(mp, Token.S));
  const ret = [];
  for (let r = 0; r < mp.length; r++) {
    for (let c = 0; c < mp[r].length; c++) {
      if (mp[r][c] === Token.D) {
        ret.push({ r: r - source.r, c: c - source.c });
      }
    }
  }
  return ret;
}

function transpose(diff: Point): Point {
  return { r: -diff.r, c: diff.c };
}

export function* getMovablePoints(
  list: DiffMoveList,
  board: Board,
  koma: Koma,
): Iterable<Point> {
  const { player } = koma;
  const srcPos = koma.position;
  if (player === 1) {
    list = list.map(transpose);
  }
  for (const p of list) {
    const dest = {
      r: srcPos.r + p.r,
      c: srcPos.c + p.c,
    };
    if (!(0 <= dest.r && dest.r < ROW_NUM && 0 <= dest.c && dest.c < COL_NUM))
      continue;
    const dstKoma = board.getKoma(dest);
    if (dstKoma?.player === player) continue;
    yield dest;
  }
}
