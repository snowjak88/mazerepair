//
// Because the default random number generator cannot be explicitly seeded,
// we have our own implementation here.
//
// Borrowed from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
//
type RNG = () => number;

const xmur3 = (str:string): RNG => {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    } return function(): number {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
};

const sfc32 = (a:number, b:number, c:number, d:number): RNG => {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
};

const Random = (seed:string): RNG => {
    const cleanedSeed = seed.replace(/[^0-9a-zA-Z]/gi, '');
    const paramGenerator = xmur3(cleanedSeed);
    const a = paramGenerator();
    const b = paramGenerator();
    const c = paramGenerator();
    const d = paramGenerator();

    console.log(`For seed=${seed}, a=${a}, b=${b}, c=${c}, d=${d}`);
    return sfc32(a, b, c, d);
};

export default Random;