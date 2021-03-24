
export function isNumericArray(x: any) : x is readonly number[] {
    return Array.isArray(x) && x.every(elem => typeof elem === "number");
  }
  
export function isStringArray(x: any) : x is readonly string[] {
  return Array.isArray(x) && x.every(elem => typeof elem === "string");
}