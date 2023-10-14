"use client";

import "./board.css";
import KomaUi from "./koma.tsx";
import { getKomaRule } from "src/rule/koma.ts";
import { Point } from "src/common/type.ts";
import { Koma } from "src/rule/type.ts";
import { BoardRule, InvalidMoveError } from "src/rule/board.ts";
import { comparePoint, flatIterable, assert } from "src/common/util.ts";
import { ROW_NUM, COL_NUM } from "src/common/constant.ts";
import { useState, useRef } from "react";
import { useImmer } from "use-immer";

enum TurnStateType {
  OVERVIEW = "overview",
  SELECTED_KOMA = "selected-koma",
}

/** The game state within a turn. */
interface TurnState {
  boardHighlight?: boolean[][];
  handleClickCell(pos: Point): TurnChange | undefined;
}

interface TurnChange {
  nextState: TurnState;
  nextTurn?: boolean;
}

class OverviewState implements TurnState {
  constructor(private readonly boardRule: BoardRule) {}

  handleClickCell(pos: Point): TurnChange | undefined {
    const koma = this.boardRule.board.getKoma(pos);
    if (!koma) return undefined;
    return { nextState: new SelectedKomaState(this.boardRule, koma) };
  }
}

class SelectedKomaState implements TurnState {
  boardHighlight?: boolean[][];
  constructor(
    private readonly boardRule: BoardRule,
    private selectedKoma: Koma,
  ) {
    const { position } = selectedKoma;
    assert(
      this.boardRule.board.getKoma(position) === this.selectedKoma,
      "Selected koma not belong to board",
    );
    this.boardHighlight = this.boardRule.getNextMap({ position });
    // For click self cancel move.
    this.boardHighlight![position.r][position.c] = true;
  }

  handleClickCell(pos: Point): TurnChange | undefined {
    if (!comparePoint(this.selectedKoma.position, pos)) {
      return { nextState: new OverviewState(this.boardRule) };
    }
    try {
      this.boardRule.move(this.selectedKoma.position, pos);
    } catch (e) {
      if (!(e instanceof InvalidMoveError)) {
        throw e;
      }
      return undefined;
    }
    return { nextState: new OverviewState(this.boardRule), nextTurn: true };
  }
}

export default function Board() {
  const [turn, setTurn] = useState<number>(0);
  const boardRule = useRef<BoardRule | undefined>(undefined);
  if (!boardRule.current) {
    boardRule.current = new BoardRule();
    boardRule.current.addChangeListener(() => void setTurn(turn + 1));
  }
  const [turnState, setTurnState] = useState<TurnState>(
    new OverviewState(boardRule.current),
  );

  function onClickCell(pos: Point) {
    const change = turnState.handleClickCell(pos);
    if (!change) return;
    const { nextState, nextTurn } = change;
    if (nextState) {
      setTurnState(nextState);
    }
    if (nextTurn) {
      setTurn(turn + 1);
    }
  }

  const boardHighlight = turnState.boardHighlight;

  return (
    <div
      className={["board", ...(boardHighlight ? ["apply-highlight"] : [])].join(
        " ",
      )}
    >
      {Array.from({ length: ROW_NUM }).map((_, r) => (
        <div className="row" key={r}>
          {Array.from({ length: COL_NUM }).map((_, c) => (
            <div
              className={[
                "cell",
                ...(turnState?.boardHighlight?.[r]?.[c] ? ["highlight"] : []),
              ].join(" ")}
              key={`${r}_${c}`}
              data-key={`${r}_${c}`}
              onClick={() => void onClickCell({ r, c })}
            ></div>
          ))}
        </div>
      ))}
      {flatIterable(boardRule.current!.board.iterKomas()).map((k, idx) => (
        <KomaUi
          koma={k}
          key={`${k.position.r}_${k.position.c}`}
          onClick={() => void onClickCell(k.position)}
        />
      ))}
    </div>
  );
}
