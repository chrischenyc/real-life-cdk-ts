export class APIError extends Error {
    readonly httpStatus: number;

    constructor(message: string, httpStatus: number) {
        super(message);

        this.name = 'APIError';
        this.httpStatus = httpStatus;
    }
}
