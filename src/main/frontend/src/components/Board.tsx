import React from 'react';

import { Grid, Paper } from '@material-ui/core';

import Random from '../game/Random';
import Direction from '../game/Direction';
import TileRepository from '../game/TileRepository';
import Tile from '../game/Tile';

import BoardTile from './BoardTile';

type BoardProps = {
    rows: number;
    cols: number;
    seed?: string;
    randomize?: boolean;
    onMove?: () => void;
    onBlockedMove?: () => void;
    onValidBoard?: (moveCount:number) => void;
    onResetBoard?: (listener:() => void) => void;
    locked?: boolean;
};

type BoardState = {
    startingTiles: Tile[][];
    tiles: Tile[][];
    validCells: boolean[][];
    moveCount: number;
};

const cardinalDirections: Direction[] = [ Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST ];

class Board extends React.Component<BoardProps, BoardState> {

    private rnd: () => number = Math.random;
    private shuffle<T>(array: T[]):T[] {
        const shuffled = Array.from(array);
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(this.rnd() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    constructor(props: BoardProps) {
        super(props);
        this.initBoardState(true);
    }

    private initBoardState(fromConstructor: boolean = false): void {
        if(this.props.seed)
            this.rnd = Random(this.props.seed);
        console.log(`Seed: ${this.props.seed}`);

        const tiles: Tile[][] = new Array(this.props.rows);
        for(let i=0; i<this.props.rows; i++)
            tiles[i] = new Array(this.props.cols);
        this.initBoard(tiles);

        if(this.props.randomize || this.props.randomize === undefined)
            this.rotateBoardTiles(tiles);
        const newState: BoardState = {
            tiles: tiles,
            startingTiles: tiles.map(row => row.map(tile => tile.clone())),
            validCells: tiles.map((row,i) => row.map((tile,j) => this.isTileValid(i, j, tiles, tile))) as boolean[][],
            moveCount: 0
        };

        if(fromConstructor) {
            this.state = newState;
            this.props.onResetBoard?.(() => this.resetBoard());
        }
        else
            this.setState(
                newState,
                () => this.props.onResetBoard?.(() => this.resetBoard()));
    }

    componentDidUpdate(prevProps: BoardProps, prevState: BoardState) {
        super.componentDidUpdate?.(prevProps, prevState);

        if(prevProps.rows !== this.props.rows || prevProps.cols !== this.props.cols
            || prevProps.seed !== this.props.seed || prevProps.randomize !== this.props.randomize)
            this.initBoardState();

        if(prevProps !== this.props)
            this.forceUpdate();
    }

    private initBoard(tiles: (Tile|undefined)[][], row:number = 0, col:number = 0): boolean {

         if(row >= tiles.length)
             return true;

         if(col >= tiles[row].length)
             return this.initBoard(tiles, row + 1, 0);

        for(let t of this.shuffle( TileRepository.getInstance().getTiles() )) {

            var tile: Tile = t;
            for(let rotation = 0; rotation < 4; rotation++) {
                tile = tile.rotate();

                if(this.isTileValid(row, col, tiles, tile)) {
                    tiles[row][col] = tile;
                    if(this.initBoard(tiles, row, col + 1))
                        return true;
                }
                tiles[row][col] = undefined;
            }
        }

         return false;
    }

    private rotateBoardTiles(tiles: Tile[][]): void {
        for(let row = 0; row < tiles.length; row++)
            for(let col = 0; col < tiles[row].length; col++)
                tiles[row][col] = tiles[row][col].rotate( Math.floor(this.rnd() * 4) );
    }

    private isTileValid(row: number, col: number, tiles:(Tile | undefined)[][] = [], tile: (Tile | undefined ) = undefined): boolean {

        if(tiles.length == 0)
            tiles = this.state.tiles;
        if(row < 0 || row >= tiles.length)
            return true;
        if(col < 0 || col >= tiles[row].length)
            return true;
        if(tile === undefined)
            tile = tiles[row][col];
        if(tile === undefined)
            return true;

        const _tile: Tile = tile as Tile;

         //
         // The tile is valid here if:
         //  - its paths connect to other tiles' paths (or to undefined locations)
         //  - its neighbors' paths connect to it
         const thisTilePathsOut = _tile.paths.every(path => {
             return path.every(direction => {
                 const { dx, dy } = Direction.toDxDy(direction);
                 const nx = col + dx;
                 const ny = row + dy;
                 if(ny < 0 || ny >= tiles.length || nx < 0 || nx >= tiles[ny].length)
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
             if(ny < 0 || ny >= tiles.length || nx < 0 || nx >= tiles[ny].length)
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
                 return _tile.paths.some(path => path.some(direction => direction === cardinalDirection));
             }));
         });

         return thisTilePathsOut && neighborsPathIn;
    }

    private onTileClick(row: number, col: number) {

        if(this.props.locked) {
            this.props.onBlockedMove?.();
            return;
        }

        this.state.tiles[row][col] = this.state.tiles[row][col].rotate();

        this.state.validCells[row][col] = this.isTileValid(row, col, this.state.tiles);

        cardinalDirections.forEach(cardinalDirection => {
            const { dx, dy } = Direction.toDxDy(cardinalDirection);
            const nx = col + dx;
            const ny = row + dy;
            if(ny < 0 || ny >= this.state.tiles.length || nx < 0 || nx >= this.state.tiles[ny].length)
                return;
            this.state.validCells[ny][nx] = this.isTileValid(ny, nx, this.state.tiles);
        });

        const isValid = this.state.validCells.every(row => row.every(cell => cell));

        this.setState(prevState => ({
            moveCount: prevState.moveCount + 1
        }), () => {
            this.props.onMove?.();
            if(isValid)
                this.props.onValidBoard?.(this.state.moveCount);
        });
    }

    private resetBoard() {
        if(this.props.locked)
            return;

        this.setState({
            tiles: this.state.startingTiles.map(row => row.map(tile => tile.clone())),
            moveCount: 0
        });
    }

    render() {
        const { rows, cols } = this.props;

        const rowElements = [];
        for(let i = 0; i < rows; i++) {
            const row = [];
            for(let j = 0; j < cols; j++) {
                const tile = this.state.tiles[i][j]
                row.push(
                    <Grid item wrap="nowrap">
                        <BoardTile key={`tile-${i}-${j}`} row={i} column={j} tile={tile} onClick={(row,col) => this.onTileClick(row,col)} />
                    </Grid>
                );
            }

            rowElements.push(
                <Grid key={`row-${i}`} container direction="row" wrap="nowrap" justifyContent="center" alignItems="center">{row}</Grid>
            );
        }

        return (
            <Paper>
                <Grid container direction="column" wrap="nowrap" justifyContent="center" alignItems="center">
                    {rowElements}
                </Grid>
            </Paper>
        );
    }
}

export default Board;