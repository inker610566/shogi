import { Koma, KomaType } from "./type.ts";
import { getKomaRule } from "./koma.ts";
import { ROW_NUM, COL_NUM } from "./constant.ts";
import { Point } from "src/common/type.ts";

export class Board {
  private readonly gridMap: Array<Array<KomaType | undefined>>;

  constructor() {}
}

export class InvalidMoveError extends Error {
  constructor(srcPos: Point, dstPos: Point, reason: string) {
    super(
      `Invalid move from ${JSON.stringify(srcPos)} to ${JSON.stringify(
        dstPos,
      )}: ${reason}`,
    );
  }
}

export class BoardRule {
  private readonly komas = new Set<Koma>();
  private komaMap: Array<Array<Koma | undefined>> = Array.from({
    length: ROW_NUM,
  }).map(() => Array.from({ length: COL_NUM }).fill(undefined));
  private readonly changeListeners = new Set<() => void>();

  private addKoma(type: KomaType, player: number, { r, c }: Point) {
    const koma = { type, player, isLevelUp: false, position: { r, c } };
    if (!this.komaMap[r][c]) {
      throw new Error(`Cannot add koma to existing position (${r}, ${c})`);
    }
    this.komaMap[r][c] = koma;
    this.komas.add(koma);
  }

  constructor() {
    // TODO: Init
  }

  getKoma({ r, c }: Point): Koma | undefined {
    return this.komaMap[r][c];
  }

  addChangeListener(listener: () => void) {
    this.addChangeListener(listener);
  }

  getNextMap(position: Point): Array<bool[]> {
    const koma = this.getKoma(position);
    if (!koma) {
      throw new Error("Call getNextMap on empty cell");
    }
    const rule = getKomaRule(koma);
    const nextMap = Array.from({
      length: ROW_NUM,
    }).map(() => Array.from({ length: COL_NUM }).fill(false));
    for (const { r, c } of rule.getMovablePoints()) {
      nextMap[r][c] = true;
    }
    return nextMap;
  }

  move(srcPos: Point, dstPos: Point) {
    const srcKoma = this.getKoma(srcPos);
    if (!srcKoma) {
      throw new InvalidMoveError(srcPos, dstPos, "No koma in srcPos");
    }

    const nextMap = this.getNextMap(srcKoma);
    if (!nextMap[dstPos.r][dstPos.c]) {
      throw new InvalidMoveError(srcPos, dstPos, "Violate koma move rule");
    }

    const dstKoma = this.getKoma(dstPos);
    if (dstKoma) {
      throw new Error("Not implement koma remove");
    }

    Object.assign(srcKoma.position, dstPos);
    this.komaMap[srcPos.r][srcPos.c] = undefined;
    this.komaMap[dstPos.r][dstPos.c] = srcKoma;

    for (const listener of [...this.changeListeners]) {
      listener();
    }
  }

  getKomaList(): Iterable<Koma> {
    return koma.values();
  }
}
