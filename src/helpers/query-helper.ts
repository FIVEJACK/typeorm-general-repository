import { Repository } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { DEFAULT_MAX_ITEM_PER_PAGE, DEFAULT_PAGE } from './constants';
import { QueryProp, QueryProps } from './interfaces';

export default class QueryHelper {
  public static where = {
    equal: (queryProp: QueryProp, inputs: ObjectLiteral) => {
      const params = {};
      params[queryProp.propName] = inputs[queryProp.propName];
      return { query: `${queryProp.col} = :${queryProp.propName}`, params: params };
    },
    like: (queryProp: QueryProp, inputs: ObjectLiteral) => {
      const params = {};
      params[queryProp.propName] = '%' + inputs[queryProp.propName] + '%';
      return { query: `${queryProp.col} LIKE :${queryProp.propName}`, params: params };
    },
    in: (queryProp: QueryProp, inputs: ObjectLiteral) => {
      const params = {};
      params[queryProp.propName] = inputs[queryProp.propName];
      return { query: `${queryProp.col} IN (:${queryProp.propName})`, params: params };
    },
    '>=': (queryProp: QueryProp, inputs: ObjectLiteral) => {
      const params = {};
      params[queryProp.propName] = inputs[queryProp.propName];
      return { query: `${queryProp.col} >= (:${queryProp.propName})`, params: params };
    },
    '<=': (queryProp: QueryProp, inputs: ObjectLiteral) => {
      const params = {};
      params[queryProp.propName] = inputs[queryProp.propName];
      return { query: `${queryProp.col} <= (:${queryProp.propName})`, params: params };
    },
    '>': (queryProp: QueryProp, inputs: ObjectLiteral) => {
      const params = {};
      params[queryProp.propName] = inputs[queryProp.propName];
      return { query: `${queryProp.col} > (:${queryProp.propName})`, params: params };
    },
    '<': (queryProp: QueryProp, inputs: ObjectLiteral) => {
      const params = {};
      params[queryProp.propName] = inputs[queryProp.propName];
      return { query: `${queryProp.col} < (:${queryProp.propName})`, params: params };
    },
  };

  public static getEntity(entity: object = {}, inputs: object = {}) {
    Object.keys(inputs).forEach(function (key, _index) {
      entity[key] = inputs[key];
    });

    return entity;
  }

  public static createQueryBuilder(repo: Repository<any>, inputs: ObjectLiteral, queryProps: QueryProps) {
    const queryBuilder = repo.createQueryBuilder();

    Object.keys(inputs).forEach((key, _index) => {
      if (queryProps[key] === undefined) return;

      const queryProp: QueryProp = queryProps[key];

      switch (queryProp.queryType) {
        case 'where':
          const { query, params } = QueryHelper.where[queryProp.operator](queryProp, inputs);
          queryBuilder.andWhere(query, params);

          break;
        case 'order':
          let order: 'ASC' | 'DESC' = 'DESC';
          switch (inputs[queryProp.propName]) {
            case 'oldest':
              order = 'ASC';
              break;
            case 'latest':
              order = 'DESC';
              break;
            default:
              order = inputs[queryProp.propName];
              break;
          }
          queryBuilder.addOrderBy(queryProp.col, order);
          break;
        default:
          break;
      }
    });

    const take = inputs['per_page'] === undefined ? DEFAULT_MAX_ITEM_PER_PAGE : inputs['per_page'];
    queryBuilder.take(take);
    const skip = inputs['page'] === undefined ? (DEFAULT_PAGE - 1) * take : (inputs['page'] - 1) * take;
    queryBuilder.skip(skip);
    if (inputs['sort'] === undefined) {
      queryBuilder.addOrderBy('created_at', 'DESC');
    }
    return queryBuilder;
  }

  public static getPage(inputs: ObjectLiteral) {
    return inputs['page'] === undefined ? DEFAULT_PAGE : inputs['page'];
  }

  public static getItemPerPage(inputs: ObjectLiteral) {
    return inputs['per_page'] === undefined ? DEFAULT_MAX_ITEM_PER_PAGE : inputs['per_page'];
  }
}
