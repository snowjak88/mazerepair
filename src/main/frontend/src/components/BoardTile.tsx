import React from 'react';

import Tile from '../game/Tile';

type BoardTileProps = {
    row: number;
    column: number;
    tile: Tile;
    rotation: number;
}

class BoardTile extends React.Component<BoardTileProps, {tile: Tile}> {

    constructor(props: BoardTileProps) {
        super(props);

        this.state = {
            tile: props.tile.rotate(props.rotation)
        }
    }

    public onClickTile(): void {
        this.setState({
            tile: this.state.tile.rotate(1)
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