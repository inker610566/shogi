"use client";

import "./board.css";
import KomaUi from "./koma.tsx";
import { Koma, getKomaRule } from "src/rule/koma.ts";
import { Point } from "src/common/type.ts";
import { BoardRule, InvalidMoveError } from "src/rule/board.ts";
import { comparePoint } from "src/common/util.ts";
import { ROW_NUM, COL_NUM } from "src/common/constant.ts";
import { useState, useRef } from "react";
import { useImmer } from "use-immer";

export default function Board() {
  const [selectedKomaPos, setSelectedKomaPos] = useState<Point | undefined>(
    undefined,
  );
  const [turn, setTurn] = useState<number>(0);
  const boardRule = useRef<BoardRule | undefined>(undefined);
  if (!boardRule.current) {
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
      setSelectedKomaPos(undefined);
      return;
    }
    const koma = boardRule.current.getKoma(pos);
    if (koma) {
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
    setSelectedKomaPos(undefined);
  }

  const nextMap = selectedKomaPos
    ? boardRule.current.getNextMap({ position: selectedKomaPos })
    : undefined;
  if (selectedKomaPos) {
      // For click self cancel move.
      nextMap[selectedKomaPos.r][selectedKomaPos.c] = true;
  }

  return (
    <div
      className={["board", ...(selectedKomaPos ? ["select-koma"] : [])].join(
        " ",
      )}
    >
      {Array.from({ length: ROW_NUM }).map((_, r) => (
        <div className="row" key={r}>
          {Array.from({ length: COL_NUM }).map((_, c) => (
            <div
              className={["cell", ...(nextMap?.[r]?.[c] ? ["next"] : [])].join(
                " ",
              )}
              key={`${r}_${c}`}
              data-key={`${r}_${c}`}
              onClick={() => void onClickCell({ r, c })}
            ></div>
          ))}
        </div>
      ))}
      {[...boardRule.current.getKomaList()].map((k, idx) => (
        <KomaUi
          koma={k}
          key={`${k.position.r}_${k.position.c}`}
          onClick={() => void onClickCell(k.position)}
        />
      ))}
    </div>
  );
}
