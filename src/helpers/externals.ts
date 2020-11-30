import { externalConfig } from 'Config/externals';
import { AxiosRequestConfig } from 'axios';
import apiCallHelper from './api-call-helper';

export enum Routing {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export default class ExternalsHelper {
  public static getAddress(module: string): string {
    const config = externalConfig[module];
    if (config === undefined) {
      return '';
    }
    const host = config.host;
    const port = config.port || 80;

    if (host === '') {
      return '';
    }
    if (port != 443) {
      return 'http://' + host + ':' + port;
    } else {
      return 'https://' + host + ':' + port;
    }
  }

  public static async sendRequest(address: string, method: AxiosRequestConfig['method'], params: object = {}, data: object = {}, headers: object = {}, retryCounter: number = 0) {
    for (const key in params) {
      if (params[key] == null) {
        delete params[key];
      }
    }

    const request = apiCallHelper.createRequest(method, address, params, data, headers, 5000, retryCounter);

    try {
      const result = await apiCallHelper.runRequest(request, retryCounter);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
