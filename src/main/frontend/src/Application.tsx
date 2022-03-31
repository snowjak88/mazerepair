import React from "react";

import Direction from "./game/Direction";
import Tile from "./game/Tile";
import TileRepository from './game/TileRepository';
import BoardTile from './components/BoardTile';

type ApplicationProp = {}

const Application = (props: ApplicationProp) => {

    const numRows = 4;
    const numCols = 4;

    const rows = [];
    for(let i = 0; i < numRows; i++) {
        const row = [];
        for(let j = 0; j < numCols; j++) {
            const tile = TileRepository.getInstance().getTile();
            const rotation = Math.floor( Math.random() * 4 );
            row.push( <BoardTile key={`tile-${i}-${j}`} row={i} column={j} tile={tile} rotation={rotation} /> );
        }

        rows.push( <tr key={`row-${i}`} className="row">{row}</tr> );
    }

    return (
        <div className={"container"}>
            <h1 className="title">Welcome To Your Template</h1>
            <table>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    );
};

export default Application;
