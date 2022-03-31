import React from 'react';

import Tile from '../game/Tile';

type BoardTileProps = {
    row: number;
    column: number;
    tile: Tile;
    rotation?: number;
    onRotate?: (row: number, column: number, tile: Tile) => void;
}

class BoardTile extends React.Component<BoardTileProps, {tile: Tile}> {

    constructor(props: BoardTileProps) {
        super(props);

        this.state = {
            tile: props.tile.rotate(props.rotation || 0)
        }
    }

    public onClickTile(): void {
        this.rotateTile();
        if(this.props.onRotate)
            this.props.onRotate(this.props.row, this.props.column, this.state.tile);
    }

    public rotateTile(steps:number = 1): void {
        this.setState({
            tile: this.state.tile.rotate(steps)
        });
    }

    render() {
        const tile = this.state.tile;
        const tileImageName = `./assets/tiles/${tile.image}`;
        return (
            <img className="boardTile"
                 onClick={() => this.onClickTile()}
                 style={{ transform: `rotate(${tile.rotation * 90}deg)` }}
                 src={tileImageName} alt={tile.name} />
        );
    }
}

export default BoardTile;