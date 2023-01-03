import {Column, createConnection, Entity, EntityManager, getConnection, getManager, getRepository, ObjectLiteral, PrimaryGeneratedColumn} from 'typeorm';
import {CommonModel, GeneralRepository, ProxyQuery} from '../src';
import {getDefault} from '../src/helpers/common-helper';
import SimplePaginationReturnObject from '../src/helpers/return-simple-pagination-object';

@Entity()
export class MyEntity extends CommonModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

  public scopeId(query: ProxyQuery<MyEntity>, id: number) {
    return query.andWhere('id = :id', {id: id});
  }

  public scopeName(query: ProxyQuery<MyEntity>, name: string) {
    return query.andWhere('name = :name', {name: name});
  }
}

export class MyRepository extends GeneralRepository<MyEntity> {
  constructor(entity: EntityManager) {
    super(MyEntity, entity);
  }

  protected commonFilter(queryBuilder: ProxyQuery<MyEntity>, filter: ObjectLiteral) {
    super.commonFilter(queryBuilder, filter);

    const name = getDefault(filter['name']);

    if (name != undefined) {
      queryBuilder = queryBuilder.Name(name);
    }
  }
}

beforeEach(async () => {
  await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [MyEntity],
    synchronize: true,
    logging: false,
  });
});

afterEach(async () => {
  let conn = getConnection();
  return await conn.close();
});
const mockDateString = '2021-09-15 20:48:34';
const mockDateNow = new Date(mockDateString);

it('should handle Name filter', async () => {
  await getRepository(MyEntity).insert({
    name: 'itemku',
  });

  await getRepository(MyEntity).insert({
    name: 'fivejack',
  });

  const repo = new MyRepository(getManager());
  const result = await repo.retrieveData({name: 'itemku'});

  expect(result.data[0].id).toEqual(1);
  expect(result.data[0].name).toEqual('itemku');

  const result2 = await repo.retrieveData({name: 'fivejack'});

  expect(result2.data[0].id).toEqual(2);
  expect(result2.data[0].name).toEqual('fivejack');
});

it('should return using simple pagination (getMany)', async () => {
  await getRepository(MyEntity).insert({
    name: 'itemku',
    created_at: mockDateNow,
    updated_at: mockDateNow,
  });

  await getRepository(MyEntity).insert({
    name: 'fivejack',
  });

  const repo = new MyRepository(getManager());
  const result: SimplePaginationReturnObject = await repo.retrieveData({name: 'itemku', use_simple_pagination: true});

  expect(repo.useSimplePagination).toEqual(true);
  expect(result).toEqual({current_page: 1, data: [{created_at: mockDateNow, id: 1, name: 'itemku', updated_at: mockDateNow}], http_status_code: 200, item_per_page: 10, message: 'Success', next_page: null, prev_page: null, success: true, total_item: 1});
});
it('should use basic pagination (getManyAndCount)', async () => {
  await getRepository(MyEntity).insert({
    name: 'itemku',
    created_at: mockDateNow,
    updated_at: mockDateNow,
  });

  await getRepository(MyEntity).insert({
    name: 'fivejack',
  });

  const repo = new MyRepository(getManager());
  const result = await repo.retrieveData({name: 'itemku'});

  expect(repo.useSimplePagination).toEqual(false);

  expect(result).toEqual({current_page: 1, data: [{created_at: mockDateNow, id: 1, name: 'itemku', updated_at: mockDateNow}], http_status_code: 200, item_per_page: 10, message: 'Success', success: true, total_item: 1});
});
