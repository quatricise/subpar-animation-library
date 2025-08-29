export function $h(query: string): HTMLElement {
  const element = document.querySelector(query)
  if(!element || element instanceof HTMLElement === false) throw new Error("No HTMLElement found by query: " + query)
  return element as HTMLElement
}

export function $s(query: string): SVGElement {
  const element = document.querySelector(query)
  if(!element || element instanceof SVGElement === false) throw new Error("No SVGElement found by query: " + query)
  return element as SVGElement
}

export function $m(query: string): MathMLElement {
  const element = document.querySelector(query)
  if(!element || element instanceof MathMLElement === false) throw new Error("No MathMLElement found by query: " + query)
  return element as MathMLElement
}