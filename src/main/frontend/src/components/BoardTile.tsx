import React from 'react';

import Tile from '../game/Tile';

type BoardTileProps = {
    row: number;
    column: number;
    tile: Tile;
    onClick?: (row: number, column: number, tile: Tile) => void;
}

class BoardTile extends React.Component<BoardTileProps, {tile: Tile}> {

    private onClickTile(): void {
        this.props.onClick?.(this.props.row, this.props.column, this.props.tile);
    }

    render() {
        const tile = this.props.tile;
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