export function clamp(value: number, min: number, max: number) {
  //does not guard against min being larger than max, but don't be an idiot and make sure your inputs are correct
  return Math.max(Math.min(value, max), min)
}

export function sum(...values: number[]): number {
  let accumulator = 0;
  values.forEach(v => accumulator += v)
  return accumulator
}