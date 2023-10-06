import { Point } from "src/common/type.ts";
import { castExists } from "src/common/util.ts";
import { ROW_NUM, COL_NUM } from "src/common/constant.ts";

export enum Token {
  EMPTY = "E",
  /** Destination. */
  D = "D",
  /** Source. */
  S = "S",
}

export type DiffMoveMap = Array<DiffMoveMapType[]>;

function findToken(mp: diffMoveFromMap, token: Token): Point | undefined {
  for (let r = 0; r < mp.length; r++) {
    for (let c = 0; c < mp[r].length; c++) {
      if (mp[r][c] === token) return { r, c };
    }
  }
  return undefined;
}

export type DiffMoveList = Array<Point[]>;

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

export function* getMovablePoints(
  list: DiffMoveList,
  board: Board,
  koma: Koma,
): Iterable<Point[]> {
  const p1 = koma.player;
  const srcPos = koma.position;
  for (const p of list) {
    const dest = {
      r: srcPos.r + p.r,
      c: srcPos.c + p.c,
    };
    if (!(0 <= dest.r && dest.r < ROW_NUM && 0 <= dest.c && dest.c < COL_NUM))
      continue;
    const dstKoma = board.getKoma(dest);
    if (dstKoma?.player === p1) continue;
    yield dest;
  }
}
