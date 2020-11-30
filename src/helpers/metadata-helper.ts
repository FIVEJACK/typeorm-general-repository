import RedisHelper from './redis';
import metadataExternal from 'Externals/metadata/metadata';

export const getConstant = async (name: string) => {
  const cacheKey = 'Constant:' + name;
  const result = await RedisHelper.get(cacheKey);
  if (result == undefined) {
    const result = await metadataExternal.retrieve({ name: name });

    if (result.data.length > 0) {
      const value = result.data[0].value;
      RedisHelper.set(cacheKey, value, 10);
      return value;
    }

    return undefined;
  }

  return result;
};

export const isMetadataFunctionActive = async (name: string) => {
  const cacheKey = 'Constant:' + name;
  const result = await RedisHelper.get(cacheKey);
  if (result == undefined) {
    const result = await metadataExternal.getConfigurationFeature({
      name: name,
      is_active: 1,
    });
    if (result.data.length > 0) {
      RedisHelper.set(cacheKey, true, 10);
      return true;
    }

    RedisHelper.set(cacheKey, false, 10);
    return false;
  }

  return result;
};
