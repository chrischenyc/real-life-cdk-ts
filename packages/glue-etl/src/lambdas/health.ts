import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import httpStatus from 'http-status';

import { APIGatewayResponse } from '../common/api';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // logging
    console.info('Lambda Invoked - APIGatewayProxyEvent', { event });

    return APIGatewayResponse(httpStatus.OK, { message: 'server is up 🚀' }, event);
};
