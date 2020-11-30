import redis from 'redis';
import { redisConfig } from 'Config/redis';

export const params = {
  host: redisConfig.host,
  port: redisConfig.port,
  db: redisConfig.db,
  prefix: redisConfig.prefix + ':',
};

if (redisConfig.password !== undefined && redisConfig.password.length > 0) {
  params['password'] = redisConfig.password;
}

const redisClient = redis.createClient(params);

export default redisClient;
