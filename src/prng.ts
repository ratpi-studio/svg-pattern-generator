/**
 * Seeded Pseudo-Random Number Generator (PRNG)
 * Allows deterministic generation of random assets, angles, and shapes.
 */

export class PRNG {
  private seed: number;

  constructor(seed: number) {
    // Avoid seed of 0 or multiples of the LCG modulus
    this.seed = seed <= 0 ? 1 : seed % 2147483647;
  }

  /**
   * Generates a random float between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    // LCG parameters: a = 16807, m = 2147483647
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /**
   * Generates a random float in range [min, max)
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates a random integer in range [min, max]
   */
  intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Randomly chooses an item from an array
   */
  choose<T>(arr: T[]): T {
    const idx = Math.floor(this.next() * arr.length);
    return arr[idx];
  }

  /**
   * Random true/false given a probability weight
   */
  boolean(probability = 0.5): boolean {
    return this.next() < probability;
  }
}
