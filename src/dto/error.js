export default class ApplicationError extends Error {

    status; cause; timestamp;
    constructor(status = 500, cause) {
        super();
        this.status = status;
        this.cause = cause;
        this.timestamp = Date.now();
    }
}

