import { Curried } from "./types";

export function useWith<Input>(
  fn: Function,
  transformers: Function[]
): Curried<Input, any> {
  let accumulatedArgs = [];
  function curriedFn(...args) {
    accumulatedArgs = accumulatedArgs.concat(args);
    if (transformers.length === accumulatedArgs.length)
      return fn.apply(
        fn,
        transformers.map((transformer, index) =>
          transformer(accumulatedArgs[index])
        )
      );
    else if (transformers.length < accumulatedArgs.length)
      return fn.apply(
        fn,
        transformers
          .map((transformer, index) => transformer(accumulatedArgs[index]))
          .concat(accumulatedArgs.slice(transformers.length))
      );
    else return curriedFn;
  }
  return curriedFn;
}
