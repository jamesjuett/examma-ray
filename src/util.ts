
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export function assert(condition: any, message: string = "") : asserts condition {
  if (!condition) {
    message && console.log(message.red);
    throw new Error(message);
  }
};

export function assertFalse(message: string = "") : never {
    throw Error("Assert failed: " + message);
};

// https://www.typescriptlang.org/docs/handbook/advanced-types.html#exhaustiveness-checking
export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

export function asMutable<T>(obj: T) : Mutable<T> {
    return <Mutable<T>>obj;
}