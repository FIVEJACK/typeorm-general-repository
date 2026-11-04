import {Column, createConnection, Entity, EntityManager, getConnection, getManager, getRepository, Logger, ObjectLiteral, PrimaryGeneratedColumn, QueryFailedError} from 'typeorm';
import {CommonModel, createProxy, GeneralRepository, isReadTimeLimitExceeded, limitReadTime, ProxyQuery, READ_TIME_LIMIT_PARAM} from '../src';
import {getDefault} from '../src/helpers/common-helper';
import SimplePaginationReturnObject from '../src/helpers/return-simple-pagination-object';

@Entity()
export class MyEntity extends CommonModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

  public scopeName(query: ProxyQuery<MyEntity>, name: string) {
    return query.andWhere('name = :name', {name: name});
  }
}

export class MyRepository extends GeneralRepository<MyEntity> {
  public seenFilterKeys: string[][] = [];

  constructor(entity: EntityManager) {
    super(MyEntity, entity);
  }

  protected commonFilter(queryBuilder: ProxyQuery<MyEntity>, filter: ObjectLiteral) {
    this.seenFilterKeys.push(Object.keys(filter));

    if (Object.keys(filter).filter(key => !['use_simple_pagination', 'page', 'per_page'].includes(key)).length === 0) {
      filter.use_simple_pagination = true;
    }

    super.commonFilter(queryBuilder, filter);

    const name = getDefault(filter['name']);

    if (name != undefined) {
      queryBuilder = queryBuilder.Name(name);
    }
  }
}

export class OwnBuilderRepository extends GeneralRepository<MyEntity> {
  constructor(entity: EntityManager) {
    super(MyEntity, entity);
  }

  public async retrieveWithOwnBuilder(filter: ObjectLiteral) {
    const proxyQueryBuilder = createProxy(this.model, this.repo().createQueryBuilder('MyEntity'));

    this.applyAllQuery(proxyQueryBuilder, filter);
    const [result, total] = await this.getPaginated(proxyQueryBuilder, filter);

    return {result, total};
  }
}

export class RawCountRepository extends GeneralRepository<MyEntity> {
  constructor(entity: EntityManager) {
    super(MyEntity, entity);
  }

  protected async executeRetrieveDataQuery(queryBuilder: ProxyQuery<MyEntity>) {
    const queryBuilderClone = queryBuilder.clone();

    queryBuilderClone.select('count(*) as count');
    queryBuilderClone.limit();
    queryBuilderClone.offset();

    const [result, totalRaw] = await Promise.all([queryBuilder.getRawMany(), queryBuilderClone.getRawOne()]);
    return [result, Number(totalRaw.count)];
  }
}

class QueryLogger implements Logger {
  public queries: string[] = [];

  logQuery(query: string) {
    this.queries.push(query);
  }

  logQueryError() {}

  logQuerySlow() {}

  logSchemaBuild() {}

  logMigration() {}

  log() {}
}

const HINT = /^SELECT \/\*\+ MAX_EXECUTION_TIME\((\d+)\) \*\/ /;
const ceilingEnv = process.env.DB_READ_MAX_EXECUTION_TIME_MS;
let logger: QueryLogger;

const selects = () => logger.queries.filter(query => /SELECT/i.test(query));

const hintsOf = (queries: string[]) => queries.map(query => (HINT.exec(query) || [])[1]);

beforeEach(async () => {
  logger = new QueryLogger();
  await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [MyEntity],
    synchronize: true,
    logger: logger,
  });

  await getRepository(MyEntity).insert([{name: 'itemku'}, {name: 'fivejack'}, {name: 'itemku'}]);
  logger.queries = [];
});

afterEach(async () => {
  if (ceilingEnv === undefined) {
    delete process.env.DB_READ_MAX_EXECUTION_TIME_MS;
  } else {
    process.env.DB_READ_MAX_EXECUTION_TIME_MS = ceilingEnv;
  }
  return await getConnection().close();
});

it('should put the hint right after SELECT on the list and its count', async () => {
  const repo = new MyRepository(getManager());

  const limited = await repo.retrieveData({name: 'itemku', per_page: 1, read_time_limit_ms: 5000});
  const queries = selects();

  expect(queries).toHaveLength(2);
  expect(queries[0]).toMatch(/^SELECT \/\*\+ MAX_EXECUTION_TIME\(5000\) \*\/ "MyEntity"\."created_at" AS "MyEntity_created_at"/);
  expect(queries[1]).toMatch(/^SELECT \/\*\+ MAX_EXECUTION_TIME\(5000\) \*\/ COUNT\(1\) AS "cnt" FROM "my_entity" "MyEntity" WHERE name = \?$/);

  logger.queries = [];
  const unlimited = await repo.retrieveData({name: 'itemku', per_page: 1});

  expect(hintsOf(selects())).toEqual([undefined, undefined]);
  expect(selects().join()).not.toContain('MAX_EXECUTION_TIME');
  expect(limited).toEqual(unlimited);
  expect(limited.total_item).toEqual(2);
});

it('should hint the single query of simple pagination without changing the page', async () => {
  const repo = new MyRepository(getManager());

  const limited: SimplePaginationReturnObject = await repo.retrieveData({use_simple_pagination: true, per_page: 2, read_time_limit_ms: '2500'});
  expect(hintsOf(selects())).toEqual(['2500']);

  logger.queries = [];
  const unlimited = await repo.retrieveData({use_simple_pagination: true, per_page: 2});

  expect(selects().join()).not.toContain('MAX_EXECUTION_TIME');
  expect(limited).toEqual(unlimited);
  expect(limited.next_page).toEqual(2);
});

it('should keep read_time_limit_ms out of the filter the scopes see, and give it back to the caller', async () => {
  const repo = new MyRepository(getManager());
  const filter = {per_page: 2, read_time_limit_ms: 1000};

  await repo.retrieveData(filter);

  expect(repo.seenFilterKeys).toEqual([['per_page']]);
  expect(repo.useSimplePagination).toEqual(true);
  expect(filter).toEqual({per_page: 2, use_simple_pagination: true, read_time_limit_ms: 1000});
  expect(hintsOf(selects())).toEqual(['1000']);
});

it('should leave the query unlimited for absent, blank, non-numeric and non-positive values', async () => {
  const repo = new MyRepository(getManager());

  for (const value of [undefined, null, '', '  ', 'abc', 0, '0', -5, '-5', 0.5, true, ['1000'], {}]) {
    logger.queries = [];
    await repo.retrieveData({[READ_TIME_LIMIT_PARAM]: value});
    expect(selects().join()).not.toContain('MAX_EXECUTION_TIME');
  }
});

it('should clamp to DB_READ_MAX_EXECUTION_TIME_MS, default 15000, and turn off at 0', async () => {
  const repo = new MyRepository(getManager());
  const hintFor = async (value: any) => {
    logger.queries = [];
    await repo.retrieveData({use_simple_pagination: true, read_time_limit_ms: value});
    return hintsOf(selects())[0];
  };

  expect(await hintFor(60000)).toEqual('15000');
  expect(await hintFor('1200.9')).toEqual('1200');

  process.env.DB_READ_MAX_EXECUTION_TIME_MS = '3000';
  expect(await hintFor(60000)).toEqual('3000');
  expect(await hintFor(1000)).toEqual('1000');

  process.env.DB_READ_MAX_EXECUTION_TIME_MS = '';
  expect(await hintFor(60000)).toEqual('15000');

  process.env.DB_READ_MAX_EXECUTION_TIME_MS = 'abc';
  expect(await hintFor(60000)).toEqual('15000');

  process.env.DB_READ_MAX_EXECUTION_TIME_MS = '0';
  expect(await hintFor(60000)).toBeUndefined();
});

it('should cover repositories that build their own query builder and call applyAllQuery', async () => {
  const repo = new OwnBuilderRepository(getManager());

  const {total} = await repo.retrieveWithOwnBuilder({read_time_limit_ms: 700});

  expect(total).toEqual(3);
  expect(hintsOf(selects())).toEqual(['700', '700']);
});

it('should cover repositories that count on a clone of the query builder', async () => {
  const repo = new RawCountRepository(getManager());

  const result = await repo.retrieveData({read_time_limit_ms: 800});

  expect(result.total_item).toEqual(3);
  expect(hintsOf(selects())).toEqual(['800', '800']);
  expect(selects().find(query => query.includes('count(*) as count'))).toMatch(/^SELECT \/\*\+ MAX_EXECUTION_TIME\(800\) \*\/ count\(\*\) as count FROM/);
});

it('should place the hint after a query comment, once, with the latest value', () => {
  const queryBuilder = getRepository(MyEntity)
    .createQueryBuilder('MyEntity')
    .comment('list');

  limitReadTime(queryBuilder, 100);
  limitReadTime(queryBuilder, 200);

  expect(queryBuilder.getSql()).toMatch(/^\/\* list \*\/ SELECT \/\*\+ MAX_EXECUTION_TIME\(200\) \*\/ "MyEntity"\."created_at"/);
  expect(queryBuilder.getSql().match(/MAX_EXECUTION_TIME/g)).toHaveLength(1);
  expect(queryBuilder.clone().getSql()).toMatch(/^SELECT \/\*\+ MAX_EXECUTION_TIME\(200\) \*\/ "MyEntity"\."created_at"/);
  expect(limitReadTime(getRepository(MyEntity).createQueryBuilder('MyEntity'), undefined).getSql()).toMatch(/^SELECT "MyEntity"\."created_at"/);
});

it('should recognise a read stopped by the hint', () => {
  const hinted = 'SELECT /*+ MAX_EXECUTION_TIME(5000) */ COUNT(*) FROM `order`';
  const timeout = new QueryFailedError(hinted, [], Object.assign(new Error('ER_QUERY_TIMEOUT: Query execution was interrupted, maximum statement execution time exceeded'), {code: 'ER_QUERY_TIMEOUT', errno: 3024}));
  const interrupted = (sql: string) => new QueryFailedError(sql, [], Object.assign(new Error('ER_QUERY_INTERRUPTED: Query execution was interrupted'), {code: 'ER_QUERY_INTERRUPTED', errno: 1317}));

  expect(isReadTimeLimitExceeded(timeout)).toEqual(true);
  expect(isReadTimeLimitExceeded(interrupted(hinted))).toEqual(true);
  expect(isReadTimeLimitExceeded(interrupted('SELECT COUNT(*) FROM `order`'))).toEqual(false);
  expect(isReadTimeLimitExceeded({driverError: {errno: 3024}})).toEqual(true);
  expect(isReadTimeLimitExceeded({errno: 1062, code: 'ER_DUP_ENTRY', query: hinted})).toEqual(false);
  expect(isReadTimeLimitExceeded(new Error('boom'))).toEqual(false);
  expect(isReadTimeLimitExceeded(undefined)).toEqual(false);
});
