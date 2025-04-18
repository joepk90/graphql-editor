import { NotFoundError } from './apiUtils';

const JSONHeader = { 'Content-Type': 'application/json' };

const AppConfig = {
  ApiUrl: '',
};

const enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type APIRequest = {
  path: string;
  headers?: HeadersInit;
};

type APIRequestWithBody<T> = APIRequest & {
  body: T;
};

// helper functions
const handleResponse = (response: Response) => {
  if (response.status === 404) {
    throw new Error(NotFoundError);
  }

  if (!response.ok) {
    throw new Error(`Response not OK: ${response.statusText}`);
  }

  return response;
};

export const makeRequest = async (path: string, requestOptions: RequestInit) => {
  const url = `${AppConfig.ApiUrl}/${path}`;

  const response = await fetch(url, requestOptions);

  return handleResponse(response);
};

type RequestOptions<T> = {
  method: Method;
  args?: APIRequest | APIRequestWithBody<T>;
};

const createRequestOptions = <T>(options: RequestOptions<T>) => {
  const { method, args } = options || {};

  const requestOptions: RequestInit = {
    method,
  };

  // if headers is passed in args, use it
  // else if body is passed in args, set headers to JSONHeader and stringify the body
  if (args && 'headers' in args) {
    requestOptions.headers = args.headers;
  } else if (args && 'body' in args) {
    requestOptions.headers = JSONHeader;
    requestOptions.body = JSON.stringify(args.body);
  }

  return requestOptions;
};

const get = async (args: APIRequest): Promise<Response> => {
  const { path } = args;
  const requestOptions = createRequestOptions({ method: Method.GET, args });
  return makeRequest(path, requestOptions);
};

const post = async <T>(args: APIRequestWithBody<T>): Promise<Response> => {
  const { path } = args;
  const requestOptions = createRequestOptions({ method: Method.POST, args });
  return makeRequest(path, requestOptions);
};

const put = async <T>(args: APIRequestWithBody<T>): Promise<Response> => {
  const { path } = args;
  const requestOptions = createRequestOptions({ method: Method.PUT, args });
  return makeRequest(path, requestOptions);
};

const handleDelete = async (path: string): Promise<Response> => {
  const requestOptions = createRequestOptions({ method: Method.DELETE });
  return makeRequest(path, requestOptions);
};

export const api = {
  get,
  post,
  put,
  delete: handleDelete,
};
