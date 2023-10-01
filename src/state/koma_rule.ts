import { Point } from "./type.ts";
import { Token as T, diffMoveFromMap } from "./diff_move_map.ts";
import {inBoard} from "/src/common/util.ts";
import * as diff_move_map from "./diff_move_map.ts";

export enum Type {
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
  readonly type: Type;
  readonly player: number;
  isLevelUp: bool;
  position: Point;
}

export interface KomaRule {
  getLabel(koma: Koma): string;
  getMovablePoints(koma: Koma): Array<[number, number]>;
}

function* genRayPoints(start: Point, diff: Point): Iterable<Point> {
    let cur = start;
    while(true) {
        cur = {r: cur.r + diff.r, c: cur.c + diff.c};
        if (!inBoard(cur)) {
            break;
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

  getMovablePoints: (koma) => {
    return [...diff_move_map.getMovablePoints(KING_DIFF_MOVE, koma.position)];
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
  
  getMovablePoints: ({isLevelUp, position}) => {
      let levelupPoints = [];
      if (isLevelUp) {
          levelupPoints = [...diff_move_map.getMovablePoints(ROOK_LEVELUP_DIFF_MOVE, position)];
      }
      
      return [
          ...genRayPoints(position, {r: -1, c: 0}),
          ...genRayPoints(position, {r: 1, c: 0}),
          ...genRayPoints(position, {r: 0, c: -1}),
          ...genRayPoints(position, {r: 0, c: 1}),
          ...levelupPoints,
      ];
  },
}

const BISHOP_LEVELUP_DIFF_MOVE = diffMoveFromMap([
  [T.E, T.D, T.E],
  [T.D, T.S, T.D],
  [T.E, T.D, T.E],
]);

export const BISHOP_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isLevelUp ? "龍馬" : "角行";
  },
  
  getMovablePoints: ({isLevelUp, position}) => {
      let levelupPoints = [];
      if (isLevelUp) {
          levelupPoints = [...diff_move_map.getMovablePoints(BISHOP_LEVELUP_DIFF_MOVE, position)];
      }
      
      return [
          ...genRayPoints(position, {r: -1, c: -1}),
          ...genRayPoints(position, {r: -1, c: 1}),
          ...genRayPoints(position, {r: 1, c: -1}),
          ...genRayPoints(position, {r: 1, c: 1}),
          ...levelupPoints,
      ];
  },
}

const GOLD_GENERAL_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.D, T.D],
  [T.D, T.S, T.D],
  [T.E, T.D, T.E],
]);

export const GOLD_GENERAL_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return "金将";
  },
  
  getMovablePoints: (koma) => {
    return [...diff_move_map.getMovablePoints(GOLD_GENERAL_DIFF_MOVE, koma.position)];
  },
}

const SLIVER_GENERAL_DIFF_MOVE = diffMoveFromMap([
  [T.D, T.D, T.D],
  [T.E, T.S, T.E],
  [T.D, T.E, T.D],
]);

export const SLIVER_GENERAL_KOMA_RULE: KomaRule = {
  getLabel: (koma) => {
    return koma.isLevelUp ? "銀将" : "成銀";
  },
  
  getMovablePoints: (koma) => {
    const diffMap = koma.isLevelUp ? GOLD_GENERAL_DIFF_MOVE : SLIVER_GENERAL_DIFF_MOVE;
    return [...diff_move_map.getMovablePoints(diffMap, koma.position)];
  },
}

const KOMA_RULE_BY_TYPE = new Map<Type, KomaRule>(
    [
        [Type.KING, KING_KOMA_RULE],
        [Type.ROOK, ROOK_KOMA_RULE],
        [Type.BISHOP, BISHOP_KOMA_RULE],
        [Type.GOLD_GENERAL, GOLD_GENERAL_KOMA_RULE],
        [Type.SILVER_GENERAL, SLIVER_GENERAL_KOMA_RULE],
    ]
);

export function getKomaRule(koma: Koma): KomaRule {
    const rule = KOMA_RULE_BY_TYPE.get(koma.type);
    if (!rule) {
        throw new Error(`Unknow type ${JSON.stringify(koma)}`);
    }
    return rule;
}
