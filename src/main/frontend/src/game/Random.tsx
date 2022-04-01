//
// Because the default random number generator cannot be explicitly seeded,
// we have our own implementation here.
//
// Borrowed from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
//
type RNG = () => number;

const mulberry32 = (a: number): RNG => {
    return function(): number {
        var t: number = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
};

//
// Singleton random-number generator factory.
//
class Random {
    private static instances: { [key: string]: RNG } = {};

    public static get(seed: string): RNG {
        if (!this.instances[seed]) {
            this.instances[seed] = mulberry32(parseInt(seed.toUpperCase(), 36));
        }
        return this.instances[seed];
    }
}

export default Random;