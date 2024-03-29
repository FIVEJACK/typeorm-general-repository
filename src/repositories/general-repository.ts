import {IRepository} from './i-repository';
import returnObject from '../helpers/return-object';
import {ObjectLiteral, Repository, SelectQueryBuilder, EntityManager} from 'typeorm';
import {DEFAULT_MAX_ITEM_PER_PAGE, DEFAULT_PAGE} from '../helpers/constants';
import {getDefault} from '../helpers/common-helper';
import {createProxy, ProxyQuery} from './proxy-repository';
import {CommonModel} from '../models/common-model';
import simplePaginationReturnObject from '../helpers/return-simple-pagination-object';

export abstract class GeneralRepository<T extends CommonModel> implements IRepository<T> {
  public model: new () => T;
  protected entity: EntityManager;
  public queryBuilder: SelectQueryBuilder<T>;
  public useSimplePagination: boolean = false;

  protected item_per_page = 10;
  protected primaryKey = 'id';

  constructor(model: new () => T, entity: EntityManager) {
    this.model = model;
    this.entity = entity;
  }

  public repo(): Repository<T> {
    return this.entity.getRepository(this.model);
  }

  public async insertBulkData(data: T[]) {
    const toReturn = new returnObject();

    const modelRepo = this.repo();

    try {
      await modelRepo.insert(data as any);
      toReturn.setData(data as any);
    } catch (error) {
      throw error;
    }

    return toReturn;
  }

  async updateById(id: number, data: T) {
    const dataUpdate: any = data;
    const toReturn = new returnObject();
    const queryBuilder = this.repo().createQueryBuilder();
    for (let keys of Object.keys(data)) {
      if (dataUpdate[keys] == null || dataUpdate[keys] == undefined) {
        delete dataUpdate[keys];
      }
    }

    const result = await queryBuilder
      .update()
      .set(data as any)
      .where('id = :id', {id: id})
      .execute();
    toReturn.setData(result as any, 1, 1, 1);
    return toReturn;
  }

  async deleteById(id: number) {
    const toReturn = new returnObject();
    const queryBuilder = this.repo().createQueryBuilder();
    const result = await queryBuilder
      .delete()
      .where('id = :id', {id: id})
      .execute();
    toReturn.setData(result as any, 1, 1, 1);
    return toReturn;
  }

  async findById(id: number) {
    const toReturn = new returnObject();
    const queryBuilder = this.repo().createQueryBuilder();
    const result = await queryBuilder
      .select()
      .where('id = :id', {id: id})
      .getOne();
    const totalItem = result ? 1 : 0;
    toReturn.setData(result as any, totalItem, totalItem, 1);
    return toReturn;
  }

  async insertData(data: T) {
    const toReturn = new returnObject();

    const modelRepo = this.repo();

    try {
      await modelRepo.insert(data as any);
      toReturn.setData(data as any);
    } catch (error) {
      throw error;
    }

    return toReturn;
  }
  protected setuseSimplePagination(value: boolean = false) {
    this.useSimplePagination = value;
  }

  async retrieveData(filter: ObjectLiteral, lockForUpdate: boolean = false) {
    let queryBuilder = this.repo().createQueryBuilder();

    if (lockForUpdate) {
      queryBuilder = queryBuilder.setLock('pessimistic_write');
    }

    const proxyQueryBuilder = createProxy(this.model as any, queryBuilder);

    this.applyAllQuery(proxyQueryBuilder, filter);
    const [result, total, itemPerPage, page] = await this.getPaginated(proxyQueryBuilder, filter);

    if (this.useSimplePagination) {
      return this.returnSimplePagination(result, itemPerPage, page);
    }
    return this.returnBasicPagination(result, total, itemPerPage, page);
  }

  private returnSimplePagination(result: any[], itemPerPage: number, page: number) {
    const toReturn = new simplePaginationReturnObject();

    let nextPage: any = null;
    const prevPage = Math.abs(page - 1) ? Math.abs(page - 1) : null;

    if (result.length > itemPerPage) {
      result.pop();
      nextPage = page + 1;
    }

    toReturn.setData(result, itemPerPage, page, prevPage, nextPage, result.length);

    return toReturn;
  }

  private returnBasicPagination(result: any, total: number, itemPerPage: number, page: number) {
    const toReturn = new returnObject();

    toReturn.setData(result, total, itemPerPage, page);

    return toReturn;
  }
  protected async getPaginated(queryBuilder: SelectQueryBuilder<T>, filter: ObjectLiteral) {
    const extraData = this.useSimplePagination ? 1 : 0;
    const itemPerPage = filter['per_page'] === undefined || filter['per_page'] < 0 ? DEFAULT_MAX_ITEM_PER_PAGE : filter['per_page'];
    const page = filter['page'] === undefined || filter['page'] <= 0 ? DEFAULT_PAGE : filter['page'];

    if (itemPerPage > 0) {
      queryBuilder.limit(itemPerPage + extraData);
    }

    const skip = (page - 1) * itemPerPage;
    queryBuilder.offset(skip);

    const [result, count] = await this.executeRetrieveDataQuery(queryBuilder);

    return [result, count, itemPerPage, page];
  }

  /*
  OVERRIDE THIS WHEN JOINING TABLE

  const queryBuilderClone = queryBuilder.clone();
  queryBuilderClone.select('count(*) as count');
  queryBuilderClone.limit();
  queryBuilderClone.offset();

  const [result, totalRaw] = await Promise.all([queryBuilder.getRawMany(), queryBuilderClone.getRawOne()]);

  return [result, totalRaw.count];
  */

  protected async executeRetrieveDataQuery(queryBuilder: SelectQueryBuilder<T>) {
    if (this.useSimplePagination) {
      const result = await queryBuilder.getMany();
      return [result];
    }
    const [result, total] = await queryBuilder.getManyAndCount();
    return [result, total];
  }

  protected commonFilter(queryBuilder: ProxyQuery<T>, filter: ObjectLiteral) {
    let commonQueryBuilder = (queryBuilder as any) as ProxyQuery<CommonModel>;

    const id = getDefault(filter['id']);
    const ids = getDefault(filter['ids']);
    const is_active = getDefault(filter['is_active']);
    const exclude_ids = getDefault(filter['exclude_ids']);
    const start_date = getDefault(filter['date_range_start']);
    const end_date = getDefault(filter['date_range_end']);
    const update_start_date = getDefault(filter['update_date_range_start']);
    const update_end_date = getDefault(filter['update_date_range_end']);
    const last_modified_by = getDefault(filter['last_modified_by']);
    const last_modified_by_id = getDefault(filter['last_modified_by_id']);
    const use_simple_pagination = getDefault(filter['use_simple_pagination'], false);

    this.setuseSimplePagination(Boolean(use_simple_pagination));

    const columnName = this.repo()
      .manager.connection.getMetadata(this.model)
      .ownColumns.map(column => column.propertyName);

    const column: any = {};
    for (let i = 0; i < columnName.length; i++) {
      column[columnName[i]] = 1;
    }

    if (id != undefined) {
      commonQueryBuilder = commonQueryBuilder.Id(id);
    }

    if (ids != undefined) {
      commonQueryBuilder = commonQueryBuilder.Ids(ids);
    }

    if (exclude_ids != undefined) {
      commonQueryBuilder = commonQueryBuilder.ExcludeIds(exclude_ids);
    }

    if (is_active != undefined && column['is_active'] != undefined) {
      commonQueryBuilder = commonQueryBuilder.IsActive(is_active);
    }

    if (start_date != undefined && column['created_at'] != undefined) {
      commonQueryBuilder = commonQueryBuilder.StartDate(start_date);
    }

    if (end_date != undefined && column['created_at'] != undefined) {
      commonQueryBuilder = commonQueryBuilder.EndDate(end_date);
    }

    if (update_start_date != undefined && column['updated_at'] != undefined) {
      commonQueryBuilder = commonQueryBuilder.UpdateStartDate(update_start_date);
    }

    if (update_end_date != undefined && column['updated_at'] != undefined) {
      commonQueryBuilder = commonQueryBuilder.UpdateEndDate(update_end_date);
    }

    if (last_modified_by != undefined && column['last_modified_by'] != undefined) {
      commonQueryBuilder = commonQueryBuilder.LastModifiedBy(last_modified_by);
    }

    if (last_modified_by_id != undefined && column['last_modified_by_id'] != undefined) {
      commonQueryBuilder = commonQueryBuilder.LastModifiedById(last_modified_by_id);
    }
  }

  protected applySelect(queryBuilder: ProxyQuery<any>, filter: ObjectLiteral) {
    const selects: Array<string> = getDefault(filter['selects']);

    if (selects != undefined && Array.isArray(selects)) {
      let arrSelects = [];

      for (let i = 0; i < selects.length; i++) {
        arrSelects[i] = this.model.name + '.' + selects[i];
      }

      queryBuilder = queryBuilder.select(arrSelects);
    }
  }

  protected commonSort(queryBuilder: ProxyQuery<T>, filter: ObjectLiteral) {
    let commonQueryBuilder = (queryBuilder as any) as ProxyQuery<CommonModel>;

    const sort = getDefault(filter['sort']);

    if (sort == 'oldest') {
      commonQueryBuilder = commonQueryBuilder.OrderByOldest();
    } else if (sort == 'latest_update') {
      commonQueryBuilder = commonQueryBuilder.OrderByLatestUpdate();
    } else {
      commonQueryBuilder = commonQueryBuilder.OrderByLatest();
    }
  }

  protected applyFilter(queryBuilder: ProxyQuery<T>, filter: ObjectLiteral) {
    this.commonFilter(queryBuilder, filter);
  }

  protected applySort(queryBuilder: ProxyQuery<T>, filter: ObjectLiteral) {
    this.commonSort(queryBuilder, filter);
  }

  protected applyAllQuery(queryBuilder: ProxyQuery<T>, filter: ObjectLiteral) {
    this.applySelect(queryBuilder, filter);
    this.applyFilter(queryBuilder, filter);
    this.applySort(queryBuilder, filter);
  }
}
