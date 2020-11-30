import { ObjectLiteral } from 'typeorm';

export interface IRepository<T> {
  insertData(data: T): any;

  insertBulkData(data: Array<T>): any;

  updateById(id: number, data: T): any;

  deleteById(id: number): any;

  retrieveData(filter: ObjectLiteral): any;

  findById(id: number): any;
}
