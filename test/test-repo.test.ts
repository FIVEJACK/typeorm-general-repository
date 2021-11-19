import {Column, createConnection, Entity, EntityManager, getConnection, getManager, getRepository, PrimaryGeneratedColumn} from 'typeorm';
import {CommonModel, createProxy, GeneralRepository, ProxyQuery} from '../src';

@Entity()
export class MyEntity extends CommonModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

  public scopeId(query: ProxyQuery<MyEntity>, id: number) {
    return query.andWhere('id = :id', {id: id});
  }
}

export class MyRepository extends GeneralRepository<MyEntity> {
  constructor(entity: EntityManager) {
    super(MyEntity, entity);
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

it('should able to add proxy and do query', async (done) => {
  await getRepository(MyEntity).insert({
    name: 'itemku',
  });

  await getRepository(MyEntity).insert({
    name: 'fivejack',
  });

  const queryBuilder = getManager().getRepository(MyEntity).createQueryBuilder();

  const proxObj = createProxy(MyEntity, queryBuilder);
  const result = await proxObj.Id(1).getMany();

  expect(result[0].id).toEqual(1);
  expect(result[0].name).toEqual('itemku');
  done();
});

it('should handle per_page = 0 for retrieve', async () => {
  await getRepository(MyEntity).insert({
    name: 'itemku',
  });

  await getRepository(MyEntity).insert({
    name: 'fivejack',
  });

  const repo = new MyRepository(getManager());

  const result = await repo.retrieveData({per_page: 0});

  expect(result.item_per_page).toEqual(0);
  expect(result.data[0].id).toEqual(1);
  expect(result.data[0].name).toEqual('itemku');
});

it('should handle multiple input', async () => {
  const repo = new MyRepository(getManager());
  let model = new repo.model();
  model.name = 'wow';
  let model2 = new repo.model();
  model2.name = 'itemku';
  const result = await repo.insertBulkData([model, model2]);

  expect(result.current_page).toEqual(1);
  expect(result.data[0].id).toEqual(1);
  expect(result.data[0].name).toEqual('wow');
});

it('should handle selects input', async () => {
  await getRepository(MyEntity).insert({
    name: 'itemku',
  });

  await getRepository(MyEntity).insert({
    name: 'fivejack',
  });

  const repo = new MyRepository(getManager());

  const result = await repo.retrieveData({selects: ['id']});

  expect(result.data[0]).toEqual({id: 1});
  expect(result.data[0].id).toEqual(1);
  expect(result.data[0].name).toBeUndefined();
});

it('should handle retrieve by id return 0 if no data instead of 1', async () => {
  await getRepository(MyEntity).insert({
    name: 'itemku',
  });

  await getRepository(MyEntity).insert({
    name: 'fivejack',
  });

  const repo = new MyRepository(getManager());

  const result = await repo.findById(3);
  expect(result.total_item).toEqual(0);

  const result2 = await repo.findById(1);
  expect(result2.total_item).toEqual(1);
});
