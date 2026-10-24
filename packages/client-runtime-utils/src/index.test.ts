import { Decimal as DecimalJS } from 'decimal.js'
import { describe, expect, it } from 'vitest'

import { Decimal } from './index'

describe('Decimal relational operators', () => {
  // Regression test for https://github.com/prisma/prisma/issues/29882
  it('compares by numeric value instead of by string', () => {
    const d = (value: string) => new Decimal(value)

    expect(d('10.1') < d('9.99')).toBe(false)
    expect(d('2') < d('10')).toBe(true)
    expect(d('9.99') >= d('10.1')).toBe(false)
    expect(d('10.00') <= d('10')).toBe(true)
    expect(d('1.5') > d('1.50')).toBe(false)
  })

  it('compares results of decimal.js methods numerically', () => {
    const d = (value: string) => new Decimal(value)

    expect(d('10.5').plus(1) > d('2')).toBe(true)
    expect(d('20').minus(9.5) > d('2')).toBe(true)
    expect(d('5.25').times(2) > d('2')).toBe(true)
    expect(d('21').div(2) > d('2')).toBe(true)
    expect(d('-10.5').abs() > d('2')).toBe(true)
    expect(d('-10.5').neg() > d('2')).toBe(true)
    expect(d('10.5').plus(1) < d('2').plus(0)).toBe(false)
    expect(Decimal.max('10.5', '2') > d('9')).toBe(true)
  })

  it('returns Prisma Decimal instances from decimal.js methods', () => {
    const result = new Decimal('10.5').plus(1)

    expect(result).toBeInstanceOf(Decimal)
    expect(Decimal.isDecimal(result)).toBe(true)
    expect(new DecimalJS('10.5').plus(1)).not.toBeInstanceOf(Decimal)
  })

  it('keeps Number() coercion numeric', () => {
    expect(Number(new Decimal('10.5'))).toBe(10.5)
    expect(+new Decimal('10.5')).toBe(10.5)
  })

  it('keeps toNumber(), sqrt() and arithmetic working for large integers', () => {
    const big = new Decimal('9007199254740993')

    expect(big.toNumber()).toBe(9007199254740992)
    expect(+big).toBe(9007199254740992)
    expect((big as unknown as number) - 1).toBe(9007199254740991)
    expect(big.sqrt().toFixed(3)).toBe('94906265.624')
    expect(new Decimal('1e1000') > new Decimal('1')).toBe(true)
  })

  it('keeps negative zero for numeric and default coercion', () => {
    const negativeZero = new Decimal('-0')

    expect(Object.is(negativeZero.toNumber(), -0)).toBe(true)
    expect(Object.is(+negativeZero, -0)).toBe(true)
    expect('' + negativeZero).toBe('-0')
    expect(`${negativeZero}`).toBe('0')
  })

  it('keeps string coercion and JSON output unchanged', () => {
    const d = new Decimal('10.10')

    expect(String(d)).toBe('10.1')
    expect(`${d}`).toBe('10.1')
    expect(d.toString()).toBe('10.1')
    expect(d.toJSON()).toBe('10.1')
    expect(JSON.stringify(new Decimal('2.50'))).toBe('"2.5"')
  })
})
