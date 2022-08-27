import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export class APIError extends Error {
    readonly httpStatus: number;

    constructor(message: string, httpStatus: number) {
        super(message);

        this.name = 'APIError';
        this.httpStatus = httpStatus;
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function APIGatewayResponse(statusCode: number, body: any, event: APIGatewayProxyEvent): APIGatewayProxyResult {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': event.headers.origin || '*',
        },
    };
}
