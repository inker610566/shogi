import { Board, Koma } from "./type.ts";
import { Point } from "src/common/type.ts";
import { Token as T, diffMoveFromMap } from "./diff_move_map.ts";
import { inBoard, flatIterable } from "src/common/util.ts";
import { KomaType as Type } from "./type.ts";
import * as diff_move_map from "./diff_move_map.ts";

export interface KomaRule {
  getLabel(koma: Koma): string;
  getMovablePoints(koma: Koma, board: Board): Array<Point>;
  canPromote: boolean;
}

function* genRayPoints(board: Board, koma: Koma, diff: Point): Iterable<Point> {
  let cur = koma.position;
  while (true) {
    cur = { r: cur.r + diff.r, c: cur.c + diff.c };
    if (!inBoard(cur)) {
      break;
    }
    const dstKoma = board.getKoma(cur);
    if (dstKoma) {
      if (dstKoma.player !== koma.player) {
        yield cur;
      }
      return;
    }
    yield cur;
  }
}

const KING_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.D, T.D],
  [T.D, T.S, T.D],
  [T.D, T.D, T.D],
]);

export const KING_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.player === 0 ? "玉将" : "王将";
  },

  getMovablePoints: (koma, board) => {
    return [...diff_move_map.getMovablePoints(KING_DIFF_MOVE, board, koma)];
  },

  canPromote: false,
};

const ROOK_LEVELUP_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.E, T.D],
  [T.E, T.S, T.E],
  [T.D, T.E, T.D],
]);

export const ROOK_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isPromoted ? "龍王" : "飛車";
  },

  getMovablePoints: (koma, board) => {
    const { isPromoted, position } = koma;
    let promotedPoints = [] as Point[];
    if (isPromoted) {
      promotedPoints = [
        ...diff_move_map.getMovablePoints(ROOK_LEVELUP_DIFF_MOVE, board, koma),
      ];
    }

    return [
      ...genRayPoints(board, koma, { r: -1, c: 0 }),
      ...genRayPoints(board, koma, { r: 1, c: 0 }),
      ...genRayPoints(board, koma, { r: 0, c: -1 }),
      ...genRayPoints(board, koma, { r: 0, c: 1 }),
      ...promotedPoints,
    ];
  },

  canPromote: true,
};

const BISHOP_LEVELUP_DIFF_MOVE = diffMoveFromMap([
  [T.E, T.D, T.E],
  [T.D, T.S, T.D],
  [T.E, T.D, T.E],
]);

export const BISHOP_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isPromoted ? "龍馬" : "角行";
  },

  getMovablePoints: (koma, board) => {
    const { isPromoted, position } = koma;
    let promotedPoints = [] as Point[];
    if (isPromoted) {
      promotedPoints = [
        ...diff_move_map.getMovablePoints(
          BISHOP_LEVELUP_DIFF_MOVE,
          board,
          koma,
        ),
      ];
    }

    return [
      ...genRayPoints(board, koma, { r: -1, c: -1 }),
      ...genRayPoints(board, koma, { r: -1, c: 1 }),
      ...genRayPoints(board, koma, { r: 1, c: -1 }),
      ...genRayPoints(board, koma, { r: 1, c: 1 }),
      ...promotedPoints,
    ];
  },

  canPromote: true,
};

const GOLD_GENERAL_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.D, T.D],
  [T.D, T.S, T.D],
  [T.E, T.D, T.E],
]);

export const GOLD_GENERAL_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return "金将";
  },

  getMovablePoints: (koma, board) => {
    return [
      ...diff_move_map.getMovablePoints(GOLD_GENERAL_DIFF_MOVE, board, koma),
    ];
  },

  canPromote: false,
};

const SLIVER_GENERAL_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.D, T.D],
  [T.E, T.S, T.E],
  [T.D, T.E, T.D],
]);

export const SLIVER_GENERAL_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isPromoted ? "銀将" : "成銀";
  },

  getMovablePoints: (koma, board) => {
    const diffMap = koma.isPromoted
      ? GOLD_GENERAL_DIFF_MOVE
      : SLIVER_GENERAL_DIFF_MOVE;
    return [...diff_move_map.getMovablePoints(diffMap, board, koma)];
  },

  canPromote: true,
};

const KNIGHT_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.E, T.D],
  [T.E, T.E, T.E],
  [T.E, T.S, T.E],
]);

export const KNIGHT_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isPromoted ? "成桂" : "桂馬";
  },

  getMovablePoints: (koma, board) => {
    const diffMap = koma.isPromoted ? GOLD_GENERAL_DIFF_MOVE : KNIGHT_DIFF_MOVE;
    return [...diff_move_map.getMovablePoints(diffMap, board, koma)];
  },

  canPromote: true,
};

export const LANCE_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isPromoted ? "成香" : "香車";
  },

  getMovablePoints: (koma, board) => {
    if (!koma.isPromoted) {
      return flatIterable(
        genRayPoints(board, koma, { r: koma.player === 1 ? 1 : -1, c: 0 }),
      );
    }
    return [
      ...diff_move_map.getMovablePoints(GOLD_GENERAL_DIFF_MOVE, board, koma),
    ];
  },

  canPromote: true,
};

export const PAWN_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isPromoted ? "と金" : "歩兵";
  },

  getMovablePoints: (koma, board) => {
    const { isPromoted, position } = koma;
    if (!isPromoted) {
      const rDiff = koma.player === 1 ? 1 : -1;
      const nextPos = { r: position.r + rDiff, c: position.c };
      return inBoard(nextPos) ? [nextPos] : [];
    }
    return [
      ...diff_move_map.getMovablePoints(GOLD_GENERAL_DIFF_MOVE, board, koma),
    ];
  },

  canPromote: true,
};

const KOMA_RULE_BY_TYPE = new Map<Type, KomaRule>([
  [Type.KING, KING_KOMA_RULE],
  [Type.ROOK, ROOK_KOMA_RULE],
  [Type.BISHOP, BISHOP_KOMA_RULE],
  [Type.GOLD_GENERAL, GOLD_GENERAL_KOMA_RULE],
  [Type.SILVER_GENERAL, SLIVER_GENERAL_KOMA_RULE],
  [Type.KNIGHT, KNIGHT_KOMA_RULE],
  [Type.LANCE, LANCE_KOMA_RULE],
  [Type.PAWN, PAWN_KOMA_RULE],
]);

export function getKomaRule(koma: Koma): KomaRule {
  const rule = KOMA_RULE_BY_TYPE.get(koma.type);
  if (!rule) {
    throw new Error(`Unknow type ${JSON.stringify(koma)}`);
  }
  return rule;
}

export function isCanPromoteMove(
  srcPos: Point,
  dstPos: Point,
  koma: Koma,
): boolean {
  if (koma.isPromoted) {
    return false;
  }
  const rule = getKomaRule(koma);
  if (!rule.canPromote) {
    return false;
  }
  const [r1, r2] = koma.player === 0 ? [0, 2] : [6, 8];
  return (
    (r1 <= srcPos.r && srcPos.r <= r2) || (r1 <= dstPos.r && dstPos.r <= r2)
  );
}
