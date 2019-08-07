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
import { Semaphore } from 'semaphore-promise';

const semaphore : Semaphore = new Semaphore( 1 );

semaphore.acquire().then( ( release ) => {
    // Do something exclusive
    release();
} );
```


## API

### `Semaphore( count : number )`

Creates a new semaphore object with <count> semaphores
    
### `acquire() : Promise<() => void>`

Resolves as soon as a semaphore could be acquired.

Returns a *release* function which is needed to `release()` the semaphore again.
    
### `tryAcquire() : () => void`

* If a semaphore is available, acquire it and return a *release* function.
* Else, throw an `Error`.
