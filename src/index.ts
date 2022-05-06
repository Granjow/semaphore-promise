let semaphoreNumber = 0;

export interface SemaphoreOptions {
    // Semaphore name; if not given, a name is assigned automatically
    name? : string;

    // Logger to print debugging messages
    logger? : {
        trace( ...args : any ) : void;
    },
}

export class Semaphore {

    public readonly name : string;

    private readonly _loggedName : string;
    private readonly _maxSemaphores : number;
    private readonly _logger : {
        trace( ...args : any ) : void;
    } | undefined;

    private _nextSemaphoreId : number = 0;
    private _currentSemaphores : Set<number>;
    private _waitingCallers : Function[];

    /**
     * Creates a new semaphore container.
     * @param count Number of available semaphores (default: 1)
     * @param opts Additional options for the semaphore
     */
    constructor( count : number = 1, opts? : SemaphoreOptions ) {
        this._maxSemaphores = count;
        this.name = opts?.name ?? `anonymous ${semaphoreNumber++}`;
        this._loggedName = `“${this.name}”`;
        this._logger = opts?.logger;
        this._currentSemaphores = new Set();
        this._waitingCallers = [];
    }

    tryAcquire(reason?:string) : () => void {
        const semaphoreId = this.nextSemaphoreId();
        this._logger?.trace( `Trying acquire for semaphore ${this._loggedName} #${semaphoreId}${reason ? ` (reason: ${reason})` : ''} …` );
        if ( this.hasAvailableSemaphores ) {
            this._logger?.trace(`tryAcquire() successful for semaphore ${this._loggedName} #${semaphoreId}`);
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
    acquire( reason? : string ) : Promise<() => void> {
        const semaphoreId = this.nextSemaphoreId();
        this._logger?.trace( `Starting acquire for semaphore ${this._loggedName} #${semaphoreId}${reason ? ` (reason: ${reason})` : ''} …` );

        const addCallerToWaitlist = ( resolve : Function ) => {
            const release = this.createReleaseFunction( semaphoreId );

            this._waitingCallers.push( () => {
                this._logger?.trace( `acquire() successful for semaphore ${this._loggedName} #${semaphoreId}` );
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
    release( id : number ) {
        this._logger?.trace( `Releasing semaphore ${this._loggedName} #${id}` )
        if ( this._currentSemaphores.has( id ) ) {
            this._currentSemaphores.delete( id );
        }
        const treatPendingCallersAfterRelease = () => this.treatPendingCallers();
        setTimeout( treatPendingCallersAfterRelease, 0 );
    }

    private nextSemaphoreId() : number {
        return this._nextSemaphoreId++;
    }

    private get hasAvailableSemaphores() : boolean {
        return this._currentSemaphores.size < this._maxSemaphores;
    }

    /**
     * @param id ID of the semaphore which is released when calling this function
     */
    private createReleaseFunction( id : number ) : () => void {
        const releaseMySemaphore = () => this.release( id );
        return releaseMySemaphore;
    }


    /**
     * When a semaphore is requested, the request is added to a queue.
     * The queue is processed by this function.
     */
    private treatPendingCallers() {
        this._logger?.trace( `Checking for free semaphore ${this._loggedName}: ${this._waitingCallers.length} waiting` );
        while ( this._waitingCallers.length > 0 && this.hasAvailableSemaphores ) {
            const caller = this._waitingCallers.shift();
            if (caller !== undefined) {
                this._logger?.trace( `Free semaphore ${this._loggedName} found, assigning.` );
                const semaphoreId = caller();
                this._currentSemaphores.add( semaphoreId );
            }
        }
    }

}

export default Semaphore;
