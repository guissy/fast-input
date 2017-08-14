import fetch from 'dva/fetch';

function parseJSON(response: Response) {
  return response.json();
}

function checkStatus(response: any): any {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error: any = new Error(response.statusText);
  error.response = response;
  // throw error;
  return Promise.reject(error);
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url: string, options?:{method?: string;}) {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then((data: any) => ({ data }))
    .catch((err: any) => ({ err }));
}
