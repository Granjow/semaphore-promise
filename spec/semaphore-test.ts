import { Semaphore } from '../src';

const sp = new Semaphore( 4 );

setInterval( () => {
    let c = 0;
    sp.acquire().then( ( releaser ) => {
        var myNumber = Math.random();
        c++;
        setTimeout( () => {
            myNumber++;
            releaser();
        }, 10 );
    } );
}, 10 );
