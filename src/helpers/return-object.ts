import {SUCCESS_STATUS_CODE, INTERNAL_ERROR_STATUS_CODE, DEFAULT_MAX_ITEM_PER_PAGE, DEFAULT_PAGE, BAD_REQUEST_STATUS_CODE} from './constants';

export default class ReturnObjectHelper {
  public success: boolean;
  public data: any;
  public message: string;
  public status_code: string;
  public http_status_code: number;
  public total_item?: number;
  public item_per_page?: number;
  public current_page?: number;
  public errors?: any[];

  public constructor(data: object = [], success: boolean = true, httpStatusCode: number = SUCCESS_STATUS_CODE, message: string = 'Success') {
    this.success = success;
    this.data = Array.isArray(data) ? data : [data];
    this.message = message;
    this.http_status_code = httpStatusCode;
  }

  public setToFailed(message: string = 'Failed', status_code: string, httpStatusCode: number = INTERNAL_ERROR_STATUS_CODE, errors?: any[]) {
    this.success = false;
    this.data = [];
    this.message = message;
    this.status_code = status_code;
    this.http_status_code = httpStatusCode;
    if (errors !== undefined) this.errors = errors;
  }

  public setData(data: object = {}, totalItem: number = 1, itemPerPage: number = DEFAULT_MAX_ITEM_PER_PAGE, currentPage: number = DEFAULT_PAGE) {
    this.data = Array.isArray(data) ? data : [data];
    this.total_item = totalItem;
    this.item_per_page = itemPerPage;
    this.current_page = currentPage;
  }

  public setToNotFound(message: string = 'Data not found', httpStatusCode: number = BAD_REQUEST_STATUS_CODE) {
    this.success = false;
    this.data = [];
    this.message = message;
    this.http_status_code = httpStatusCode;
  }

  public setMessage(message: string = '') {
    this.message = message;
  }

  public setStatusCode(statusCode: string) {
    this.status_code = statusCode;
  }

  public setHTTPStatusCode(httpStatusCode: number) {
    this.http_status_code = httpStatusCode;
  }
}
