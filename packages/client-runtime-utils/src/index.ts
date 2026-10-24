import { Decimal as DecimalJS } from 'decimal.js'

export * from './errors'
export * from './nullTypes'

/**
 * Prisma's `Decimal` (re-exported to users as `Prisma.Decimal`) is decimal.js,
 * whose `valueOf()` returns a *string*. Relational operators (`<`, `>`, `<=`,
 * `>=`) and `Number()` coerce operands with the `"number"` hint, which without
 * this override falls back to `valueOf()` — so
 * `new Decimal('10.1') < new Decimal('9.99')` compared the strings `'10.1' <
 * '9.99'` and evaluated to `true` (the wrong answer).
 *
 * Overriding `Symbol.toPrimitive` (which takes precedence over `valueOf`)
 * resolves the `"number"` hint to the numeric value of `valueOf()`. The
 * `"default"` hint keeps `valueOf()` and the `"string"` hint keeps `toString()`,
 * matching ordinary-object coercion before this override (the two differ only
 * for negative zero: `'-0'` vs `'0'`). So `toString()`, `toJSON()`, template
 * literals, string concatenation and `JSON.stringify` are unchanged.
 *
 * The numeric value is a double, so relational operators are exact only within
 * double precision (not beyond `Number.MAX_SAFE_INTEGER`, and values past
 * ~1.8e308 become `Infinity`). Use `lt`/`gt`/`cmp` for exact ordering there. A
 * BigInt is not returned for large integers because the `"number"` hint is also
 * used by unary `+`, mixed-number arithmetic and decimal.js internals
 * (`toNumber()`, `sqrt()`), all of which throw on a BigInt.
 *
 * The class subclasses `decimal.js` rather than mutating the shared `decimal.js`
 * prototype, so third-party `import Decimal from 'decimal.js'` usage in the same
 * process is unaffected.
 *
 * https://github.com/prisma/prisma/issues/29882
 */
export class Decimal extends DecimalJS {
  [Symbol.toPrimitive](hint: 'default' | 'number' | 'string'): number | string {
    if (hint === 'number') {
      return Number(this.valueOf())
    }
    return hint === 'default' ? this.valueOf() : this.toString()
  }
}

export { empty, join, raw, type RawValue, Sql, default as sql, type Value } from 'sql-template-tag'
