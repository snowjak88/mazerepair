import React from "react";

import Direction from "./game/Direction";
import Tile from "./game/Tile";
import TileRepository from './game/TileRepository';
import BoardTile from './components/BoardTile';

type ApplicationProp = {}

function shuffle<T>(array: T[]):T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const buildBoard = (tiles: (Tile|undefined)[][], numRows:number, numCols:number, row:number = 0, col:number = 0): boolean => {

    if(row >= numRows)
        return true;

    if(col >= numCols)
        return buildBoard(tiles, numRows, numCols, row + 1, 0);

    const cardinalDirections = [ Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST ];

    for(let t of shuffle(TileRepository.getInstance().getTiles())) {

        var tile: Tile = t;
        for(let rotation = 0; rotation < 4; rotation++) {
            tile = tile.rotate();

            //
            // The tile is valid here if:
            //  - its paths connect to other tiles' paths (or to undefined locations)
            //  - its neighbors' paths connect to it
            const thisTilePathsOut = tile.paths.every(path => {
                return path.every(direction => {
                    const { dx, dy } = Direction.toDxDy(direction);
                    const nx = col + dx;
                    const ny = row + dy;
                    if(nx < 0 || nx >= numCols || ny < 0 || ny >= numRows)
                        return true;
                    const neighbor = tiles[ny][nx];
                    if(neighbor === undefined)
                        return true;
                    return neighbor.paths.some(otherPath => otherPath.some(otherDirection => direction === Direction.opposite(otherDirection)));
                });
            });

            const neighborsPathIn = cardinalDirections.every(cardinalDirection => {
                //
                // Is there a neighboring tile in the cardinalDirection?
                const { dx, dy } = Direction.toDxDy(cardinalDirection);
                const nx = col + dx;
                const ny = row + dy;
                if(nx < 0 || nx >= numCols || ny < 0 || ny >= numRows)
                    return true;
                const neighbor = tiles[ny][nx];
                if(neighbor === undefined)
                    return true;

                // For every path in this neighbor, it must either have nothing to
                // do with the cardinal-direction, or else there must be a corresponding direction
                // in our tile that connects to it.
                return neighbor.paths.every(neighborPath => neighborPath.every(neighborDirection => {
                    if(cardinalDirection !== Direction.opposite(neighborDirection))
                        return true;
                    return tile.paths.some(path => path.some(direction => direction === cardinalDirection));
                }));
            });

            if(thisTilePathsOut && neighborsPathIn) {
                tiles[row][col] = tile;
                if(buildBoard(tiles, numRows, numCols, row, col + 1))
                    return true;
            }
            tiles[row][col] = undefined;
        }
    }

    return false;
}

const Application = (props: ApplicationProp) => {

    const numRows:number = 3;
    const numCols:number = 4;

    const tiles: Tile[][] = new Array(numRows);
    for(let i=0; i<numCols; i++)
        tiles[i] = new Array(numCols);
    buildBoard(tiles, numRows, numCols);

    const rows = [];
    for(let i = 0; i < numRows; i++) {
        const row = [];
        for(let j = 0; j < numCols; j++) {
            const tile = tiles[i][j]
            row.push( <BoardTile key={`tile-${i}-${j}`} row={i} column={j} tile={tile} /> );
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
