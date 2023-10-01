import { Point } from "./type.ts";
import { Token as T, diffMoveFromMap } from "./diff_move_map.ts";
import * as diff_move_map from "./diff_move_map.ts";
import {Koma, Type} from "./koma_rule.ts";

const KING_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.D, T.D],
  [T.D, T.S, T.D],
  [T.D, T.D, T.D],
]);

export class KingKoma implements Koma {
  readonly type = Type.KING;
  isLevelUp = false;

  constructor(
    readonly player: number,
    readonly position: Point,
  ) {}
}
