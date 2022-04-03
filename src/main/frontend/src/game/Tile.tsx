
//
// Tile as described in .../tiles.json
//
import Direction from './Direction';

class Tile {
    id: string;
    name: string;
    image: string;
    paths: Direction[][];
    rotation: number;

    constructor(id: string, name: string, image: string, paths: Direction[][], rotation: number = 0) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.paths = paths;
        this.rotation = rotation;
    }

    public clone(): Tile {
        return new Tile(this.id, this.name, this.image, this.paths, this.rotation);
    }

    private static rotatePaths(paths: Direction[][], steps: number): Direction[][] {
        if (steps === 0)
            return paths;
        else
            return paths.map(path => path.map(direction => Direction.clockwise(direction, steps)));
    }

    //
    // Rotate this tile clockwise by the given number of steps.
    // Returns a new Tile instance.
    public rotate(steps: number = 1): Tile {
        return new Tile(
            this.id,
            this.name,
            this.image,
            Tile.rotatePaths(this.paths, steps),
            ( steps + this.rotation ) % 4
        );
    }

    //
    // Determines if this tile has at least one path to the given direction.
    public hasPathTo(direction: Direction): boolean {
        return this.paths.some(path => path.some(d => d === direction));
    }

    //
    // For the given other tile offset from this tile by dx/dy,
    // determine if this tile and the other are connected by at least one path.
    public pathTo(other: Tile, dx: number, dy: number): boolean {
        //
        // The other tile is offset from us by dx/dy.
        // Therefore, if this tile has no path with a direction matching that offset,
        // there cannot be a path.
        // Likewise, if the other tile has no path with a direction matching the inverse of dx/dy,
        // there cannot be a path.
        //
        const thisPathExists = this.paths.some(path => path.some(direction => direction === Direction.fromDxDy(dx, dy)));
        const otherPathExists = other.paths.some(path => path.some(direction => direction === Direction.fromDxDy(-dx, -dy)));
        return thisPathExists && otherPathExists;
    }
}

export default Tile;