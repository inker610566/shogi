import { ROW_NUM, COL_NUM } from "src/common/constant.ts";
import { assert } from "src/common/util.ts";
import { Point } from "src/common/type.ts";

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
  isPromoted: boolean;
  position: Point;
}

export class Board {
  private readonly komas = new Set<Koma>();
  private komaMap: Array<Array<Koma | undefined>> = Array.from({
    length: ROW_NUM,
  }).map(() => Array.from({ length: COL_NUM }).fill(undefined)) as Array<
    Array<Koma | undefined>
  >;

  addKoma(type: KomaType, player: number, { r, c }: Point) {
    const koma = { type, player, isPromoted: false, position: { r, c } };
    if (this.komaMap[r][c]) {
      throw new Error(`Cannot add koma to existing position (${r}, ${c})`);
    }
    this.komaMap[r][c] = koma;
    this.komas.add(koma);
  }

  getKoma({ r, c }: Point): Koma | undefined {
    return this.komaMap[r][c];
  }

  updatePosition(koma: Koma, pos: Point) {
    assert(this.komas.has(koma), "Call updatePosition() with owned koma");
    this.komaMap[koma.position.r][koma.position.c] = undefined;
    this.komaMap[pos.r][pos.c] = koma;
    Object.assign(koma.position, pos);
  }

  removeKoma(koma: Koma) {
    assert(this.komas.has(koma), "Call removeKoma() with owned koma");
    this.komas.delete(koma);
    this.komaMap[koma.position.r][koma.position.c] = undefined;
  }

  iterKomas(): Iterable<Koma> {
    return this.komas.values();
  }

  constructor() {}
}
