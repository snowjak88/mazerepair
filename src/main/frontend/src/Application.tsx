import React from "react";

import Direction from "./game/Direction";
import Tile from "./game/Tile";
import TileRepository from './game/TileRepository';
import Board from "./components/Board";

type ApplicationProp = {};

type ApplicationState = {
  seed: string;
}

class Application extends React.Component<ApplicationProp, ApplicationState> {

    constructor(props: ApplicationProp) {
        super(props);
        this.state = {
            seed: Application.getTodayString()
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
            seed: Application.getRandomString()
        });
    }

    private todayPuzzle() {
        this.setState({
            seed: Application.getTodayString()
        });
    }

    render() {
        console.log(`Application.render() seed=${this.state.seed}`);
        return (
                <div className={"container"}>
                    <h1 className="title">Maze-Repair</h1>
                    <div className="gameControls">
                        <button onClick={() => this.randomPuzzle()}>Random</button>
                        <button onClick={() => this.todayPuzzle()}>Today's Maze</button>
                    </div>
                    <Board rows={5} cols={5} seed={this.state.seed} />
                </div>
            );
    }
}

export default Application;
