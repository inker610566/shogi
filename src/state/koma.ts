import { Point } from "./type.ts";
import { Token as T, diffMoveFromMap } from "./diff_move_map.ts";
import * as diff_move_map from "./diff_move_map.ts";

export enum Type {
  King = "王",
  Rook = "飛",
  Bishop = "角",
  GoldGeneral = "金",
  SilverGeneral = "銀",
  Knight = "桂",
  Lance = "香",
  Pawn = "歩",
}

export interface Koma {
  readonly type: Type;
  readonly player: number;
  isLevelUp: bool;
  position: Point;
  getLabel(): string;
  getMovablePoints(): Array<[number, number]>;
}

const KING_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.D, T.D],
  [T.D, T.S, T.D],
  [T.D, T.D, T.D],
]);

export class KingKoma implements Koma {
  readonly type = Type.King;
  isLevelUp = False;

  constructor(
    readonly player: number,
    readonly position: Point,
  ) {}

  getLabel(): string {
    return this.player === 0 ? "玉" : "王";
  }

  getMovablePoints(): Array<Point> {
    return [...diff_move_map.getMovablePoints(KING_DIFF_MOVE, this.position)];
  }
}
