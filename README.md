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

## semaphore-promise with TypeScript

This library can be used in TypeScript files as well.

```typescript
import { Semaphore } from 'semaphore-promise';

const semaphore : Semaphore = new Semaphore( 1 );

semaphore.acquire().then( ( release ) => {
    // Do something exclusive
    release();
} );
```


