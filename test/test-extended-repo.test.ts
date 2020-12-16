import {Column, createConnection, Entity, EntityManager, getConnection, getManager, getRepository, ObjectLiteral, PrimaryGeneratedColumn} from 'typeorm';
import {CommonModel, GeneralRepository, ProxyQuery} from '../src';
import {getDefault} from '../src/helpers/common-helper';

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
