"use client";

import "./board.css";
import KomaUi from "./koma.tsx";
import { Koma, getKomaRule } from "src/state/koma_rule.ts";
import { KingKoma } from "src/state/koma.ts";
import { Point } from "src/common/type.ts";
import { comparePoint } from "src/common/util.ts";
import { ROW_NUM, COL_NUM } from "src/common/constant.ts";
import { useState } from "react";
import { useImmer } from "use-immer";

export default function Board() {
  const [selectedKomaIdx, setSelectedKomaIdx] = useState<number>(-1);
  const [allKomas, setAllKomas] = useImmer<Koma[]>([
    new KingKoma(0, { r: 3, c: 3 }),
  ]);
  const selectedKoma = allKomas[selectedKomaIdx];
  let nextMap: bool[][] | undefined = undefined;
  if (selectedKoma) {
    const rule = getKomaRule(selectedKoma);
    nextMap = Array.from({ length: ROW_NUM }).map(() =>
      Array.from({ length: ROW_NUM }).map(() => false),
    );
    for (const cell of rule.getMovablePoints(selectedKoma)) {
      nextMap[cell.r][cell.c] = true;
    }
    nextMap[selectedKoma.position.r][selectedKoma.position.c] = true;
  }

  function onClickCell(r: number, c: number) {
    const clickedKomaIdx = allKomas.findIndex(
      ({ position: p }) => p.r === r && p.c === c,
    );
    if (selectedKomaIdx === -1) {
      if (clickedKomaIdx) {
        setSelectedKomaIdx(clickedKomaIdx);
      }
      return;
    }

    if (r === selectedKoma.position.r && c === selectedKoma.position.c) {
      setSelectedKomaIdx(-1);
      return;
    }

    if (nextMap[r][c]) {
      // Check if occupied.
      setAllKomas((allKomas) => {
        allKomas[selectedKomaIdx].position = { r, c };
      });
      setSelectedKomaIdx(-1);
    }
  }

  function onClickKoma(e: Event, komaIdx: number) {
    // Judge player.
    if (!selectedKoma) {
      setSelectedKomaIdx(komaIdx);
      return;
    }
    if (!comparePoint(selectedKoma.position, allKomas[komaIdx])) {
      setSelectedKomaIdx(-1);
    }
  }

  return (
    <div
      className={["board", ...(selectedKoma ? ["select-koma"] : [])].join(" ")}
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
              onClick={() => onClickCell(r, c)}
            ></div>
          ))}
        </div>
      ))}
      {allKomas.map((k, idx) => (
        <KomaUi
          koma={k}
          key={`${k.position.r}_${k.position.c}`}
          onClick={(e) => onClickKoma(e, idx)}
        />
      ))}
    </div>
  );
}
