# promise-map
Adds map capability to promise

## API

`import promiseMap from 'promise-map'`
`promise-map(Promise)`

Single default idempotent export which adds `.map` to the given promise library (or built-in if not given)

### Promise.map
`result = await Promise.map(iterable, mapper, options)`

Iterates over the iterarble (or promise of an iterable), passing the results into the mapper function.

Returns a promise of an array of the results.

Options:

- `concurrency` how many can be run at a time (default Infinity)

Function available as `<promise>.map(mapper, options)`

This is monkey-patching. Bad. Naughty.
