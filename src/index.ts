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

    /**
     * Acquire a new semaphore.
     * The returned promise resolves as soon as a semaphore is available and returns a function `release`
     * which has to be used to release the acquired promise.
     * @return {Promise<Function>}
     */
    acquire() : Promise<Function> {
        const promise = new Promise<Function>( ( resolve ) => {

            const semaphoreId = Symbol();
            const release = () => {
                this.release( semaphoreId );
            };

            this._waitingCallers.push( () => {
                resolve( release );
                return semaphoreId;
            } );
        } );
        setTimeout( () => this.treatPendingCallers(), 0 );
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
        setTimeout( () => this.treatPendingCallers(), 0 );
    }


    /**
     * When a semaphore is requested, the request is added to a queue.
     * The queue is processed by this function.
     */
    private treatPendingCallers() {
        while ( this._waitingCallers.length > 0 && this._currentSemaphores.size < this._maxSemaphores ) {
            const semaphoreId = this._waitingCallers.shift()();
            this._currentSemaphores.add( semaphoreId );
        }
    }

}
