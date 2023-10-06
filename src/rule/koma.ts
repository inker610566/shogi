import { Board, Koma } from "./type.ts";
import { Point } from "src/common/type.ts";
import { Token as T, diffMoveFromMap } from "./diff_move_map.ts";
import { inBoard } from "/src/common/util.ts";
import { KomaType as Type } from "./type.ts";
import * as diff_move_map from "./diff_move_map.ts";

export interface KomaRule {
  getLabel(koma: Koma): string;
  getMovablePoints(koma: Koma, board: Board): Array<[number, number]>;
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
};

const ROOK_LEVELUP_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.E, T.D],
  [T.E, T.S, T.E],
  [T.D, T.E, T.D],
]);

export const ROOK_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isLevelUp ? "龍王" : "飛車";
  },

  getMovablePoints: (koma, board) => {
    const { isLevelUp, position } = koma;
    let levelupPoints = [];
    if (isLevelUp) {
      levelupPoints = [
        ...diff_move_map.getMovablePoints(ROOK_LEVELUP_DIFF_MOVE, board, koma),
      ];
    }

    return [
      ...genRayPoints(board, koma, { r: -1, c: 0 }),
      ...genRayPoints(board, koma, { r: 1, c: 0 }),
      ...genRayPoints(board, koma, { r: 0, c: -1 }),
      ...genRayPoints(board, koma, { r: 0, c: 1 }),
      ...levelupPoints,
    ];
  },
};

const BISHOP_LEVELUP_DIFF_MOVE = diffMoveFromMap([
  [T.E, T.D, T.E],
  [T.D, T.S, T.D],
  [T.E, T.D, T.E],
]);

export const BISHOP_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isLevelUp ? "龍馬" : "角行";
  },

  getMovablePoints: (koma, board) => {
    const { isLevelUp, position } = koma;
    let levelupPoints = [];
    if (isLevelUp) {
      levelupPoints = [
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
      ...levelupPoints,
    ];
  },
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
};

const SLIVER_GENERAL_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.D, T.D],
  [T.E, T.S, T.E],
  [T.D, T.E, T.D],
]);

export const SLIVER_GENERAL_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isLevelUp ? "銀将" : "成銀";
  },

  getMovablePoints: (koma, board) => {
    const diffMap = koma.isLevelUp
      ? GOLD_GENERAL_DIFF_MOVE
      : SLIVER_GENERAL_DIFF_MOVE;
    return [...diff_move_map.getMovablePoints(diffMap, board, koma)];
  },
};

const KNIGHT_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.E, T.D],
  [T.E, T.E, T.E],
  [T.E, T.S, T.E],
]);

export const KNIGHT_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isLevelUp ? "成桂" : "桂馬";
  },

  getMovablePoints: (koma, board) => {
    const diffMap = koma.isLevelUp ? GOLD_GENERAL_DIFF_MOVE : KNIGHT_DIFF_MOVE;
    return [...diff_move_map.getMovablePoints(diffMap, board, koma)];
  },
};

export const LANCE_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isLevelUp ? "成香" : "香車";
  },

  getMovablePoints: (koma, board) => {
    if (!koma.isLevelUp) {
      return genRayPoints(board, koma, { r: -1, c: 0 });
    }
    return [
      ...diff_move_map.getMovablePoints(GOLD_GENERAL_DIFF_MOVE, board, koma),
    ];
  },
};

export const PAWN_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isLevelUp ? "と金" : "歩兵";
  },

  getMovablePoints: (koma, board) => {
    const { isLevelUp, position } = koma;
    if (!isLevelUp) {
      return [{ r: position.r - 1, c: position.c }];
    }
    return [
      ...diff_move_map.getMovablePoints(GOLD_GENERAL_DIFF_MOVE, board, koma),
    ];
  },
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
