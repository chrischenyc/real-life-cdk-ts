import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import httpStatus from 'http-status';

import { APIError, APIGatewayResponse } from '../common/api';
import { userStore } from '../store/user/user-store';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.info('Lambda Invoked - APIGatewayProxyEvent', { event });

    try {
        const username = event.pathParameters?.username;
        if (username === undefined) {
            throw new APIError('missing path parameter :user', httpStatus.BAD_REQUEST);
        }

        if (!event.body) {
            throw new APIError('missing request body', httpStatus.BAD_REQUEST);
        }

        await userStore.updateUser(username, JSON.parse(event.body));

        return APIGatewayResponse(httpStatus.OK, { message: 'user updated' }, event);
    } catch (error) {
        if (error instanceof APIError) {
            return APIGatewayResponse(error.httpStatus, { message: error.message }, event);
        } else {
            return APIGatewayResponse(httpStatus.INTERNAL_SERVER_ERROR, { message: error }, event);
        }
    }
};
