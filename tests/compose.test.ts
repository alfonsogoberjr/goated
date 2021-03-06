import { compose } from "../dist/compose";
import { map } from "../dist/map";
import { reduce } from "../dist/reduce";

import * as mocha from "mocha";
import * as chai from "chai";
import { Curried } from "../src/types";

const expect = chai.expect;

describe("goated.compose()", () => {
  it("should compose unary functions", () => {
    const addThree = (num) => num + 3;
    const negate = (num) => -num;
    const addThreeThenNegate = compose<number, number>(negate, addThree);

    expect(addThreeThenNegate(3)).to.equal(-6);
  });

  it("should compose with a multiple arity function as first argument", () => {
    const negate = (num) => -num;
    const powThenNegate = compose<number, number>(negate, Math.pow);

    expect(powThenNegate(3, 3)).to.equal(-27);
  });

  it("should compose with map and reduce", () => {
    const double = map((num: number) => num * 2);
    const add = (a, b) => a + b;
    const doubleThenAdd = compose<number[], number>(
      reduce(add, 0),
      <Curried<number, number>>double
    );

    expect(doubleThenAdd([1, 2, 3])).to.equal(12);
  });

  it("should compose async", async () => {
    const double = map((num: number) => num * 2);
    const add = (a, b) => a + b;
    const fetch = async (num) => ({ foo: num });

    const doubleThenAddFetch = compose<number[], Promise<{ foo: number }>>(
      fetch,
      reduce(add, 0),
      <Curried<number, number>>double
    );

    expect(await doubleThenAddFetch([1, 2, 3])).to.deep.equal({ foo: 12 });
  });
});
