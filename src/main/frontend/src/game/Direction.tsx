//
// Denotes cardinal directions, and provides functionality
// for rotating and inverting.
//
enum Direction {
    NORTH,
    EAST,
    SOUTH,
    WEST
}

namespace Direction {

    const _clockwise: { [key: number]: number } = {
        [Direction.NORTH]: Direction.EAST,
        [Direction.EAST]: Direction.SOUTH,
        [Direction.SOUTH]: Direction.WEST,
        [Direction.WEST]: Direction.NORTH
    };

    const _opposite: { [key: number]: number } = {
        [Direction.NORTH]: Direction.SOUTH,
        [Direction.EAST]: Direction.WEST,
        [Direction.SOUTH]: Direction.NORTH,
        [Direction.WEST]: Direction.EAST
    };

    const _dxdy: { [key: string]: Direction } = {
        ["0/-1"]: Direction.NORTH,
        ["1/0"]: Direction.EAST,
        ["0/1"]: Direction.SOUTH,
        ["-1/0"]: Direction.WEST
    };

    const _names: { [key: string]: Direction} = {
        "NORTH": Direction.NORTH,
        "EAST": Direction.EAST,
        "SOUTH": Direction.SOUTH,
        "WEST": Direction.WEST
    }

    export function fromString(s: string): Direction {
        return _names[s];
    }

    export function clockwise(direction: Direction, steps: number = 1): Direction {
        let d: Direction = direction;
        for(var i=1; i<=steps; i++)
            d = _clockwise[d];
        return d;
    }

    export function opposite(direction: Direction): Direction {
        return _opposite[direction];
    }

    export function fromDxDy(dx: number, dy:number): Direction {
        return _dxdy[`${dx}/${dy}`];
    }
}

export default Direction;