import { NotFoundError } from './apiUtils';
import { getApiUrl } from 'src/utils';

const JSONHeader = { 'Content-Type': 'application/json' };

export const AppConfig = {
  ApiUrl: getApiUrl(),
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

  const response = await fetch(url, {
    credentials: 'include',
    ...requestOptions,
  });

  return handleResponse(response);
};

type RequestOptions<T> = {
  method: Method;
  args?: APIRequest | APIRequestWithBody<T>;
};

// TODO REVIEW THIS AWFUL FUNCTION createRequestOptions
const createRequestOptions = <T>(options: RequestOptions<T>) => {
  const { method, args } = options || {};

  const requestOptions: RequestInit = {
    method,
  };

  if (args && 'body' in args) {
    requestOptions.body = JSON.stringify(args.body);
    requestOptions.headers = JSONHeader;
  }

  return requestOptions;
};

const get = async (args: APIRequest): Promise<Response> => {
  const { path } = args;
  const requestOptions = createRequestOptions({ method: Method.GET, args });
  return makeRequest(path, requestOptions);
};

const post = async <T>(args: APIRequestWithBody<T>): Promise<Response> => {
  const { path, body, headers } = args;
  const requestOptions = {
    method: Method.POST,
    body: String(body),
    headers: headers,
  };
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
