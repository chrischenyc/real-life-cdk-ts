import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import httpStatus from 'http-status';

import { APIError, APIGatewayResponse } from '../common/api';
import { userStore } from '../store/user/user-store';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.info('Lambda Invoked - APIGatewayProxyEvent', { event });

    try {
        if (!event.body) {
            throw new APIError('missing request body', httpStatus.BAD_REQUEST);
        }

        await userStore.createUser(JSON.parse(event.body));

        return APIGatewayResponse(httpStatus.CREATED, { message: 'user created' }, event);
    } catch (error) {
        if (error instanceof APIError) {
            return APIGatewayResponse(error.httpStatus, { message: error.message }, event);
        } else {
            return APIGatewayResponse(httpStatus.INTERNAL_SERVER_ERROR, { message: error }, event);
        }
    }
};
