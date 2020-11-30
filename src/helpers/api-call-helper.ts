import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import sleep from 'sleep-promise';
import Bugsnag from '@bugsnag/js';

enum ErrCode {
  ETIMEDOUT = 'ETIMEDOUT',
  ECONNABORTED = 'ECONNABORTED',
  ECONNRESET = 'ECONNRESET',
  ECONNREFUSED = 'ECONNREFUSED',
}

class APICallHelperClass {
  config: AxiosRequestConfig;
  retryCounter: number;

  constructor() {
    this.config = {};
    this.retryCounter = 0;
    this.handleAxiosError.bind(this);
  }

  createRequest(method: AxiosRequestConfig['method'], endpoint: string, params: any, data: any, headers: any, timeout: number, retryCounter: number = 0) {
    this.config = {
      method: method,
      url: endpoint,
      params: params,
      data: data,
      headers: headers,
      timeout: timeout,
    };
    this.retryCounter = retryCounter;

    const request = axios.create();

    return request;
  }

  public async runRequest(axiosRequest: AxiosInstance, retryCounter) {
    try {
      const result = await axiosRequest.request(this.config);

      return result.data;
    } catch (error) {
      return await this.handleAxiosError(axiosRequest, error, retryCounter);
    }
  }

  public async handleAxiosError(axiosRequest: AxiosInstance, error: any, retryCounter: number = 0) {
    const errorCode = error.code;
    const response = error.response;
    const errorMessage = error.message;
    console.log(retryCounter, retryCounter > 3);
    if (retryCounter > 3) {
      const config = this.config;
      Bugsnag.notify(error, function (event) {
        event.addMetadata('config', {
          config,
        });
        event.addMetadata('response', {
          errorMessage,
        });
      });

      error.message = 'Axios : ' + errorMessage + ' ' + this.config.method + ' ' + this.config.url + '   ' + error.message;

      throw error;
    }

    retryCounter++;

    switch (errorCode) {
      case ErrCode.ETIMEDOUT: {
        console.log('Retrying ' + this.config.method + ' ' + this.config.url + ' due to timeout ...' + '(' + retryCounter + ')');
        break;
      }
      case ErrCode.ECONNABORTED: {
        console.log('Retrying ' + this.config.method + ' ' + this.config.url + ' due to connection aborted ...' + '(' + retryCounter + ')');
        break;
      }
      case ErrCode.ECONNRESET: {
        console.log('Retrying ' + this.config.method + ' ' + this.config.url + ' due to connection reset ...' + '(' + retryCounter + ')');
        break;
      }
      case ErrCode.ECONNREFUSED: {
        console.log('Retrying ' + this.config.method + ' ' + this.config.url + ' due to connection refused ...' + '(' + retryCounter + ')');
        break;
      }
      default:
        if (response === undefined) {
          console.log('Retrying ' + this.config.method + ' ' + this.config.url + ' due to undefined response ...' + '(' + retryCounter + ')');
          console.log(this.config.params);
        } else {
          const responseStatus = response.status;
          if (Math.floor(responseStatus / 100) === 4) {
            const config = this.config;
            const responseError = response.data;
            Bugsnag.notify(error, function (event) {
              event.addMetadata('config', {
                config,
              });
              event.addMetadata('response', {
                responseError,
              });
            });

            if (responseStatus == 403) {
              const messages = response.data;
              const errorMessage = messages[Object.keys(messages)[0]];
              error.message = '403 ' + this.config.method + ' ' + this.config.url + ' ' + errorMessage + '   ' + error.message;

              throw error;
            } else if (responseStatus == 422) {
              const messages = response.data;
              const errorMessage = messages[Object.keys(messages)[0]];
              error.message = 'Axios : 422 ' + this.config.method + ' ' + this.config.url + ' ' + errorMessage + '   ' + error.message;

              throw error;
            }
            console.log(responseStatus + ' ' + this.config.method + ' ' + this.config.url);
            console.log(this.config.params, this.config.data);
            error.message = 'Axios : ' + responseStatus + ' ' + this.config.method + ' ' + this.config.url + '   ' + error.message;

            throw error;
          } else if (Math.floor(responseStatus / 100) === 5) {
            await sleep(retryCounter * 1000);
            console.log('Retrying ' + this.config.method + ' ' + this.config.url + ' due to ' + responseStatus + ' error ...');
          } else {
            console.log('Retrying ' + this.config.method + ' ' + this.config.url + ' due to ' + errorMessage + ' error ...');
          }
          console.log(this.config.data);
        }
    }

    return await this.runRequest(axiosRequest, retryCounter);
  }
}

export default new APICallHelperClass();
