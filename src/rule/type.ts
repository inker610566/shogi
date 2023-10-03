export enum KomaType {
  KING = "王",
  ROOK = "飛",
  BISHOP = "角",
  GOLD_GENERAL = "金",
  SILVER_GENERAL = "銀",
  KNIGHT = "桂",
  LANCE = "香",
  PAWN = "歩",
}

export interface Koma {
  readonly type: KomaType;
  readonly player: number;
  isLevelUp: bool;
  position: Point;
}
