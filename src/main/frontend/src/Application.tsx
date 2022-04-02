import React from "react";

import Direction from "./game/Direction";
import Tile from "./game/Tile";
import TileRepository from './game/TileRepository';
import Board from "./components/Board";
import CompletionHistory from "./components/CompletionHistory";

type ApplicationProp = {};

type ApplicationState = {
  seed: string;
  boardLocked: boolean;
}

class Application extends React.Component<ApplicationProp, ApplicationState> {

    private completionHistoryListener: ((moveCount:number) => void) | null = null;

    constructor(props: ApplicationProp) {
        super(props);
        this.state = {
            seed: Application.getTodayString(),
            boardLocked: false
        };
    }

    private static getTodayString(): string {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    }

    private static getRandomString(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private randomPuzzle() {
        this.setState({
            seed: Application.getRandomString(),
            boardLocked: false
        });
    }

    private todayPuzzle() {
        this.setState({
            seed: Application.getTodayString(),
            boardLocked: false
        });
    }

    private gameOver(moveCount:number) {
        this.completionHistoryListener?.(moveCount);
        this.setState({
            boardLocked: true
        });
    }

    render() {
        return (
                <div className={"container"}>
                    <h1 className="title">Maze-Repair</h1>
                    <div className="gameControlsContainer">
                        <button onClick={() => this.randomPuzzle()}>Random</button>
                        <button onClick={() => this.todayPuzzle()}>Today's Maze</button>
                    </div>
                    <div className="gameBoardHistoryContainer">
                        <div className="gameBoardContainer">
                            <Board rows={5} cols={5} seed={this.state.seed} locked={this.state.boardLocked} onValidBoard={(moveCount) => this.gameOver(moveCount)} />
                        </div>
                        <div className="gameHistoryContainer">
                            <CompletionHistory registerCompletionListener={(listener) => this.completionHistoryListener = listener}
                                               unregisterCompletionListener={() => this.completionHistoryListener = null} />
                        </div>
                    </div>
                </div>
            );
    }
}

export default Application;
