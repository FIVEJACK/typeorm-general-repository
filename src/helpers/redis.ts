import redis, { params } from 'Helpers/redis-Instance';
import util from 'util';

export default class RedisHelper {
  public static async set(key: string, value: any, minute: number = 1) {
    if (value === undefined) {
      return undefined;
    }
    const setAsync = util.promisify(redis.set).bind(redis);

    try {
      await setAsync(key, JSON.stringify(value), 'EX', minute * 60);

      return true;
    } catch (error) {
      console.log(error);

      return undefined;
    }
  }

  public static async get(key: string) {
    const getAsync = util.promisify(redis.get).bind(redis);

    try {
      const value = await getAsync(key);

      return JSON.parse(value);
    } catch (error) {
      console.log(error);

      return undefined;
    }
  }

  public static async forget(key: string) {
    const delAsync = util.promisify(redis.del).bind(redis);

    try {
      await delAsync(key);

      return true;
    } catch (error) {
      throw error;
    }
  }

  public static async deleteKeysByPattern(key: string) {
    const scanAsync = util.promisify(redis.scan).bind(redis);

    const keys = [];
    const recursiveScan = async (cursor: number, match: string) => {
      const res = await scanAsync(cursor, 'MATCH', match);
      cursor = res[0];

      keys.push(...res[1]);
      if (cursor == 0) {
        return keys;
      }

      return recursiveScan(cursor, match);
    };

    try {
      const values = await recursiveScan(0, params.prefix + key);

      for (const value of values) {
        const key = value.substring(params.prefix.length);
        RedisHelper.forget(key);
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
