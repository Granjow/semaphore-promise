import { Semaphore } from '../src';

describe( 'Semaphore basics', () => {

    it( 'can acquire', ( ok ) => {
        const semaphore = new Semaphore( 1 );
        semaphore.acquire().then( ok );
    } );

    it( 'can release', ( ok ) => {
        const semaphore = new Semaphore( 1 );
        semaphore.acquire().then( ( releaser ) => {
            releaser();
            semaphore.acquire().then( ok );
        } );
    } );

    it( 'does not acquire more than 1 semaphore', ( ok ) => {
        const semaphore = new Semaphore( 1 );
        semaphore.acquire().then( () => semaphore.acquire().then( () => {
            expect( 'A second semaphore was acquired' ).toBe( 'not happening' );
        } ) );
        setTimeout( ok, 20 );
    }, 50 );

    it( 'runs seconds semaphore after releasing first one', ( ok ) => {
        const semaphore = new Semaphore( 1 );
        semaphore.acquire().then( ( releaser ) => {
            semaphore.acquire().then( ok );
            setTimeout( releaser as any, 10 );
        } );
    }, 50 );

} );

describe( 'Semaphore performance', () => {

    const N = 10000;

    it( `runs ${N} semaphores`, ( ok ) => {

        const tStart = Date.now();
        const semaphore = new Semaphore( 2 );

        const finish = () => {
            const dt = Date.now() - tStart;
            console.log( `${N} semaphores completed after ${dt} ms` );
            ok();
        };

        let c = 0;
        for ( let i = 0; i < N; i++ ) {
            setTimeout( () => {
                semaphore.acquire().then( ( release ) => {
                    if ( ++c === N ) finish();
                    release();
                } );
            }, 0 );
        }
    }, 5000 );

} );
