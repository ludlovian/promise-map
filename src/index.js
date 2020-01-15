export default function promiseMap (PromiseLibrary = Promise) {
  if (typeof PromiseLibrary !== 'function') return
  if (!PromiseLibrary.prototype.map) {
    PromiseLibrary.prototype.map = map
  }
  if (!PromiseLibrary.map) {
    PromiseLibrary.map = function map (iterable, ...args) {
      return PromiseLibrary.resolve(iterable).map(...args)
    }
  }
}

function map (mapper, { concurrency = Infinity } = {}) {
  const P = this.constructor
  return this.then(
    iterable =>
      new P((resolve, reject) => {
        const iterator = getIterator(iterable)
        let active = 0
        let count = 0
        const result = []
        let done

        fetchOne()

        function fetchOne () {
          if (done) return
          const item = iterator.next()
          if (thenable(item)) item.then(startOne, reject)
          else startOne(item)
        }

        function startOne (item) {
          if (item.done) {
            done = true
            if (!active) resolve(result)
            return
          }
          active++
          const idx = count++
          P.resolve(item.value)
            .then(mapOne.bind(null, idx))
            .then(storeOne.bind(null, idx), reject)
          if (active < concurrency) fetchOne()
        }

        function mapOne (idx, val) {
          return mapper(val, idx)
        }

        function storeOne (idx, val) {
          result[idx] = val
          active--
          fetchOne()
          if (done && !active) resolve(result)
        }
      })
  )

  function thenable (p) {
    return p instanceof P || typeof p.then === 'function'
  }
}

function getIterator (iterable) {
  if (Symbol.asyncIterator in iterable) {
    return iterable[Symbol.asyncIterator]()
  }
  if (Symbol.iterator in iterable) {
    return iterable[Symbol.iterator]()
  }
  throw new TypeError('It is not an iterable')
}
