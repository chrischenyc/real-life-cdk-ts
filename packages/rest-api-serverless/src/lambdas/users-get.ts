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

        const user = await userStore.getUser(username);

        return APIGatewayResponse(httpStatus.OK, user, event);
    } catch (error) {
        if (error instanceof APIError) {
            return APIGatewayResponse(error.httpStatus, { message: error.message }, event);
        } else {
            return APIGatewayResponse(httpStatus.INTERNAL_SERVER_ERROR, { message: error }, event);
        }
    }
};
