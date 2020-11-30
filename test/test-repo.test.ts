import {
  Column,
  createConnection,
  Entity,
  getConnection,
  getManager,
  getRepository,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { createProxy, ProxyQuery } from '../src';

@Entity()
export class MyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

  public scopeId(query: ProxyQuery<MyEntity>, id: number) {
    return query.andWhere('id = :id', { id: id });
  }
}

beforeEach(() => {
  return createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [MyEntity],
    synchronize: true,
    logging: false,
  });
});

afterEach(() => {
  let conn = getConnection();
  return conn.close();
});

it('should able to add proxy and do query', async done => {
  await getRepository(MyEntity).insert({
    name: 'itemku',
  });

  await getRepository(MyEntity).insert({
    name: 'fivejack',
  });

  const queryBuilder = getManager()
    .getRepository(MyEntity)
    .createQueryBuilder();

  const proxObj = createProxy(MyEntity, queryBuilder);
  const result = await proxObj.Id(1).getMany();

  expect(result).toEqual([{ id: 1, name: 'itemku' }]);
  done();
});
