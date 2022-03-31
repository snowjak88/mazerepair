//
// Singleton class that handles retrieving all tiles from the server.
//
import Tile from './Tile';
import Direction from './Direction';
import tilesJson from './tiles.json';

type TileDescriptor = {
    id: string;
    name: string;
    image: string;
    paths: string[][];
};

class TileRepository {
    private static _instance: TileRepository;

    public static getInstance(): TileRepository {
        if (!TileRepository._instance) {
            TileRepository._instance = new TileRepository();
        }
        return TileRepository._instance;
    }

    private tiles: Tile[];

    private constructor() {
        this.tiles = [];

        const descriptors = tilesJson as TileDescriptor[];
        descriptors.forEach(descriptor => {
            const paths = descriptor.paths.map(path => {
                return path.map(Direction.fromString);
            });
            this.tiles.push(new Tile(descriptor.id, descriptor.name, descriptor.image, paths));
        });
    }

    public getTiles(): Tile[] {
        return this.tiles;
    }

    public getTile(id: string = ""): Tile {

        const matchingTiles = (id) ? this.tiles.filter(tile => tile.id === id) : this.tiles;
        if(id && matchingTiles.length === 0) {
            throw new Error(`No tile with id ${id}`);
        }
        if(matchingTiles.length === 1) {
            throw matchingTiles[0];
        }
        return matchingTiles[Math.floor( Math.random() * matchingTiles.length )];
    }
}

export default TileRepository;