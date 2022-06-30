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
    frequency?: number;
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
        const baseFrequency = descriptors.reduce((min, descriptor) => Math.min(min, (descriptor.frequency ?? 1.0)), 1.0);
        descriptors.forEach(descriptor => {
            const paths = descriptor.paths.map(path => {
                return path.map(Direction.fromString);
            });

            descriptor.frequency = Math.ceil((descriptor.frequency ?? 1.0) / baseFrequency);

            for(let i=0;i<descriptor.frequency; i++)
                this.tiles.push(new Tile(descriptor.id, descriptor.name, descriptor.image, paths));
        });
    }

    public getTiles(): Tile[] {
        return this.tiles;
    }

    public getTile(id: string = "", rnd: () => number = Math.random): Tile {

        const matchingTiles = (id) ? this.tiles.filter(tile => tile.id === id) : this.tiles;
        if(id && matchingTiles.length === 0) {
            throw new Error(`No tile with id ${id}`);
        }
        if(matchingTiles.length === 1) {
            throw matchingTiles[0];
        }
        return matchingTiles[Math.floor( rnd() * matchingTiles.length )];
    }
}

export default TileRepository;