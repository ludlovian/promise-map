import test from 'ava'
import promiseMap from '../src'

promiseMap()

test('installed', t => {
  t.is(typeof Promise.map, 'function')
  t.is(typeof Promise.prototype.map, 'function')
})

test('is idempotent', t => {
  t.notThrows(promiseMap)
})

test('non promise lib', t => {
  t.notThrows(() => promiseMap({}))
})

test('simple instance iterator', async t => {
  const p = Promise.resolve([1, 2, 3]).map(x => 10 * x)
  t.true(p instanceof Promise)
  const result = await p
  t.deepEqual(result, [10, 20, 30])
})

test('simple class iterator', async t => {
  const p = Promise.map([1, 2, 3], x => 10 * x)
  t.true(p instanceof Promise)
  const result = await p
  t.deepEqual(result, [10, 20, 30])
})

test('async instance iterator', async t => {
  async function * iter () {
    await delay(10)
    yield 1
    await delay(10)
    yield 2
    await delay(10)
    yield 3
  }

  const p = Promise.resolve(iter()).map(x => x * 10)
  t.true(p instanceof Promise)
  const result = await p
  t.deepEqual(result, [10, 20, 30])
})

test('async map function', async t => {
  const p = Promise.map([3, 1, 2], async x => {
    await delay(10 * x)
    return 10 * x
  })
  const result = await p
  t.deepEqual(result, [30, 10, 20])
})

test('empty iterable', async t => {
  const p = Promise.map([], x => x)
  t.deepEqual(await p, [])
})

test('concurrency limited', async t => {
  let count = 0
  async function fn (x) {
    count++
    t.true(count <= 3)
    await delay(30)
    count--
    return x * 10
  }

  const result = await Promise.map([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], fn, {
    concurrency: 3
  })

  t.deepEqual(result, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90])
})

test('non-iterable', async t => {
  await t.throwsAsync(() => Promise.map({}, x => x))
})

test('iterable that wait before ending', async t => {
  async function * fn () {
    yield 1
    yield 2
    yield 3
    await delay(30)
  }

  const result = await Promise.map(fn(), x => x * 2)
  t.deepEqual(result, [2, 4, 6])
})

test('mapper that throws', async t => {
  const err = new Error('oops')

  function fn (x) {
    if (x === 2) throw err
    return x * 2
  }
  const p = Promise.resolve([1, 2, 3]).map(fn)
  const e = await t.throwsAsync(p)
  t.is(e, err)
})

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
