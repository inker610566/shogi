"use client";

import "./board.css";
import KomaUi from "./koma.tsx";
import { Koma, getKomaRule, Type } from "src/state/koma_rule.ts";
import { KingKoma, RookKoma } from "src/state/koma.ts";
import { Point } from "src/common/type.ts";
import { comparePoint } from "src/common/util.ts";
import { ROW_NUM, COL_NUM } from "src/common/constant.ts";
import { useState, useRef } from "react";
import { useImmer } from "use-immer";

const INITIAL_ROW1 = [
  Type.LANCE,
  Type.KNIGHT,
  Type.SILVER_GENERAL,
  Type.GOLD_GENERAL,
  Type.KING,
  Type.GOLD_GENERAL,
  Type.SILVER_GENERAL,
  Type.KNIGHT,
  Type.LANCE,
];

function initialKomas(isFirst: bool): Koma[] {
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
    komas.push(
      ...INITIAL_ROW1.map((t, c) => ({
        type: t,
        player,
        isLevelUp: false,
        position: transpose({ r: 0, c }),
      })),
    );
    komas.push(
      ...[1, COL_NUM - 2].map((c) => ({
        type: (c === 1) ^ (player === player1) ? Type.ROOK : Type.BISHOP,
        player,
        isLevelUp: false,
        position: transpose({ r: 1, c }),
      })),
    );
    komas.push(
      ...Array.from({ length: COL_NUM }).map((_, c) => ({
        type: Type.PAWN,
        player,
        isLevelUp: false,
        position: transpose({ r: 2, c }),
      })),
    );
  }
  return komas;
}

export default function Board() {
  const [selectedKomaPos, setSelectedKomaPos] = useState<Point | undefined>(
    undefined,
  );
  const [turn, setTurn] = useState<number>(0);
  const boardRule = useRef<BoardRule | undefined>(undefined);
  if (!boardRule) {
    boardRule.current = new BoardRule();
    boardRule.current.addChangeListener(() => void setTurn(turn + 1));
  }

  function onClickCell(pos: Point) {
    if (selectedKomaPos === undefined) {
      const koma = boardRule.current.getKoma(pos);
      if (koma) {
        // TODO: Check player.
        setSelectedKomaPos(pos);
      }
      return;
    }
    if (!comparePoint(selectedKomaPos, pos)) {
      return;
    }
    const koma = boardRule.current.getKoma(pos);
    if (!koma) {
      return;
    }
    // TODO: Check player.
    try {
      boardRule.current.move(selectedKomaPos, pos);
    } catch (e) {
      if (!(e instanceof InvalidMoveError)) {
        throw e;
      }
      return;
    }
    setTurn(turn + 1);
  }

  const nextMap = selectedKomaPos
    ? boardRule.current.getNextMap(selectedKomaPos)
    : undefined;

  return (
    <div
      className={["board", ...(selectedKomaPos ? ["select-koma"] : [])].join(
        " ",
      )}
    >
      {Array.from({ length: ROW_NUM }).map((_, r) => (
        <div className="row">
          {Array.from({ length: COL_NUM }).map((_, c) => (
            <div
              className={["cell", ...(nextMap?.[r]?.[c] ? ["next"] : [])].join(
                " ",
              )}
              data-key={`${r}_${c}`}
              onClick={() => void onClickCell({ r, c })}
            ></div>
          ))}
        </div>
      ))}
      {boardRule.current.getKomaList().map((k, idx) => (
        <KomaUi koma={k} key={`${k.position.r}_${k.position.c}`} />
      ))}
    </div>
  );
}
