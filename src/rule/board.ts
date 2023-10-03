import { Koma, KomaType } from "./type.ts";
import { getKomaRule } from "./koma.ts";
import { ROW_NUM, COL_NUM } from "src/common/constant.ts";
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

const INITIAL_ROW1 = [
  KomaType.LANCE,
  KomaType.KNIGHT,
  KomaType.SILVER_GENERAL,
  KomaType.GOLD_GENERAL,
  KomaType.KING,
  KomaType.GOLD_GENERAL,
  KomaType.SILVER_GENERAL,
  KomaType.KNIGHT,
  KomaType.LANCE,
];

function* initialKomas(
  isFirst: bool,
): Iterable<{ type: KomaType; player: number; position: Point }> {
  const player1 = isFirst ? 0 : 1;
  const player2 = 1 - player1;
  const komas = [];
  for (const player of [player2, player1]) {
    function transpose(p: Point) {
      if (player === player2) {
        return p;
      }
      return { c: p.c, r: ROW_NUM - 1 - p.r };
    }
    for (let c = 0; c < INITIAL_ROW1.length; c++) {
      yield {
        type: INITIAL_ROW1[c],
        player,
        position: transpose({ r: 0, c }),
      };
    }
    yield {
      type: KomaType.ROOK,
      player,
      position:
        player === player1
          ? { r: ROW_NUM - 2, c: COL_NUM - 2 }
          : { r: 1, c: 1 },
    };
    yield {
      type: KomaType.BISHOP,
      player,
      position:
        player === player1
          ? { r: ROW_NUM - 2, c: 1 }
          : { r: 1, c: COL_NUM - 2 },
    };
    for (let c = 0; c < COL_NUM; c++) {
      yield {
        type: KomaType.PAWN,
        player,
        position: transpose({ r: 2, c }),
      };
    }
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
    if (this.komaMap[r][c]) {
      throw new Error(`Cannot add koma to existing position (${r}, ${c})`);
    }
    this.komaMap[r][c] = koma;
    this.komas.add(koma);
  }

  constructor() {
    for (const { type, player, position } of initialKomas(true)) {
      this.addKoma(type, player, position);
    }
  }

  getKoma({ r, c }: Point): Koma | undefined {
    return this.komaMap[r][c];
  }

  addChangeListener(listener: () => void) {
    this.changeListeners.add(listener);
  }

  getNextMap({koma, position}: {koma?: koma, position?: Point}): Array<bool[]> {
    if (!koma) {
        if (!position) {
            throw new Error('Invalid call');
        }
        koma = this.getKoma(position);
        if (!koma) {
          throw new Error("Call getNextMap on empty cell");
        }
    }
    const rule = getKomaRule(koma);
    const nextMap = Array.from({
      length: ROW_NUM,
    }).map(() => Array.from({ length: COL_NUM }).fill(false));
    for (const { r, c } of rule.getMovablePoints(koma)) {
      nextMap[r][c] = true;
    }
    return nextMap;
  }

  move(srcPos: Point, dstPos: Point) {
    const srcKoma = this.getKoma(srcPos);
    if (!srcKoma) {
      throw new InvalidMoveError(srcPos, dstPos, "No koma in srcPos");
    }

    const nextMap = this.getNextMap({koma: srcKoma});
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
    return this.komas.values();
  }
}
