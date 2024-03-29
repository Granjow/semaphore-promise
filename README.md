# semaphore-promise

Promise based, TypeScript compatible semaphore library.

```js
const Semaphore = require( 'semaphore-promise' );

const semaphore = new Semaphore( 1 );
semaphore.acquire().then( ( release ) => {
    // Do something exclusive
    release();
} );
```

This library can be used in **TypeScript** files as well.

```typescript
import Semaphore from 'semaphore-promise';
```


## API

### `Semaphore( count : number, opts? : opts )`

Creates a new semaphore object with `count` semaphores.

`opts` can contain …

* a `name` for the semaphore which is used by the logger.
* a `logger` like [pino](https://www.npmjs.com/package/pino) to log debug messages.
  If no logger is provided, nothing is logged.
    
### `acquire() : Promise<() => void>`

Resolves as soon as a semaphore could be acquired. Waiting callers are treated in FIFO order.

Returns a *release* function which is needed to `release()` the semaphore again.
    
### `tryAcquire() : () => void`

* If a semaphore is available, acquire it and return a *release* function.
* Else, throw an `Error`.


## Changelog

* **v1.4.0** (2022-05-06)
  * Add logging capabilities to simplify debugging issues like deadlocks.
  * Add names to semaphore, also for debugging.
* **v1.3.0** (2022-02-10)
  * Add default export so `import Semaphore from 'semaphore-promise'` can be used (without curly braces)
  * Default to 1 semaphore in the constructor
  * Docs: Add note on FIFO order
* **v1.2.0** (2019-08-07)
  * Add `tryAcquire()`
