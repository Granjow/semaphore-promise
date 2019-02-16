export class Semaphore {

    private readonly _maxSemaphores : number;

    private _currentSemaphores : Set<Symbol>;
    private _waitingCallers : Function[];

    constructor( count : number ) {
        this._maxSemaphores = count;
        this._currentSemaphores = new Set();
        this._waitingCallers = [];
    }

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

    release( id : Symbol ) {
        if ( this._currentSemaphores.has( id ) ) {
            this._currentSemaphores.delete( id );
        }
        setTimeout( () => this.treatPendingCallers(), 0 );
    }


    treatPendingCallers() {
        while ( this._waitingCallers.length > 0 && this._currentSemaphores.size < this._maxSemaphores ) {
            const semaphoreId = this._waitingCallers.shift()();
            this._currentSemaphores.add( semaphoreId );
        }
    }

}
