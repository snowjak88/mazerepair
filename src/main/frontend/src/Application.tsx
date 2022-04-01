import React from "react";

import Direction from "./game/Direction";
import Tile from "./game/Tile";
import TileRepository from './game/TileRepository';
import Board from "./components/Board";

type ApplicationProp = {}

const Application = (props: ApplicationProp) => {

    return (
        <div className={"container"}>
            <h1 className="title">Maze-Repair</h1>
            <Board rows={6} cols={6} seed={"ABCDE12345"} />
        </div>
    );
};

export default Application;
