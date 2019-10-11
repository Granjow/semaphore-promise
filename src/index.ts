export class Semaphore {

    private readonly _maxSemaphores : number;

    private _currentSemaphores : Set<Symbol>;
    private _waitingCallers : Function[];

    /**
     * Creates a new semaphore container.
     * @param count Number of available semaphores
     */
    constructor( count : number ) {
        this._maxSemaphores = count;
        this._currentSemaphores = new Set();
        this._waitingCallers = [];
    }

    tryAcquire() : () => void {
        const semaphoreId = Symbol();
        if ( this.hasAvailableSemaphores ) {
            this._currentSemaphores.add( semaphoreId );
            return this.createReleaseFunction( semaphoreId );
        } else {
            throw new Error( 'No semaphore available.' );
        }
    }

    /**
     * Acquire a new semaphore.
     * The returned promise resolves as soon as a semaphore is available and returns a function `release`
     * which has to be used to release the acquired promise.
     * @return {Promise<Function>}
     */
    acquire() : Promise<() => void> {
        const addCallerToWaitlist = ( resolve : Function ) => {

            const semaphoreId = Symbol();
            const release = this.createReleaseFunction( semaphoreId );

            this._waitingCallers.push( () => {
                resolve( release );
                return semaphoreId;
            } );
        };
        const treatPendingCallersNow = () => this.treatPendingCallers();

        const promise = new Promise<() => void>( addCallerToWaitlist );
        setTimeout( treatPendingCallersNow, 0 );

        return promise;
    }

    /**
     * Release the given semaphore.
     * This is usually done from inside the resolve callback because the ID is only known there.
     */
    release( id : Symbol ) {
        if ( this._currentSemaphores.has( id ) ) {
            this._currentSemaphores.delete( id );
        }
        const treatPendingCallersAfterRelease = () => this.treatPendingCallers();
        setTimeout( treatPendingCallersAfterRelease, 0 );
    }

    private get hasAvailableSemaphores() : boolean {
        return this._currentSemaphores.size < this._maxSemaphores;
    }

    /**
     * @param id ID of the semaphore which is released when calling this function
     */
    private createReleaseFunction( id : Symbol ) : () => void {
        const releaseMySemaphore = () => this.release( id );
        return releaseMySemaphore;
    }


    /**
     * When a semaphore is requested, the request is added to a queue.
     * The queue is processed by this function.
     */
    private treatPendingCallers() {
        while ( this._waitingCallers.length > 0 && this.hasAvailableSemaphores ) {
            const semaphoreId = this._waitingCallers.shift()();
            this._currentSemaphores.add( semaphoreId );
        }
    }

}
