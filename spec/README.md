# semaphore-promise

Promise based semaphore library.

```js
const Semaphore = require( 'semaphore-promise' );

const semaphore = new Semaphore( 1 );

semaphore.acquire().then( ( release ) => {
    // Do something exclusive
    release();
} );
```


