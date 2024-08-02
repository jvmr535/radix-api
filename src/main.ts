import { Handler } from 'aws-lambda';
import { createServer } from './server-instance';

export const handler: Handler = async (event, context, callback) => {
  const server = await createServer();
  return server(event, context, callback);
};
