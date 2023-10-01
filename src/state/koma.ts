import { Point } from "./type.ts";
import { Token as T } from "./diff_move_map.ts";
import { Koma, Type } from "./koma_rule.ts";

export class KingKoma implements Koma {
  readonly type = Type.KING;
  isLevelUp = false;

  constructor(
    readonly player: number,
    readonly position: Point,
  ) {}
}

export class RookKoma implements Koma {
  readonly type = Type.ROOK;
  isLevelUp = true;

  constructor(
    readonly player: number,
    readonly position: Point,
  ) {}
}
