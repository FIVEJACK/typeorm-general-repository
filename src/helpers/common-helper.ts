export const dateHelper = (date: any) => {
  return date < 10 ? '0' + date : date;
};

export const booleanHelper = (bool: any) => {
  return bool === true ? 1 : bool === false ? 0 : bool;
};

export const reindexArray = (data: [], index: any) => {
  const result = {};

  data.forEach((entry) => {
    if (entry[index] !== undefined) {
      if (result[entry[index]] === undefined) {
        result[entry[index]] = entry;
      }
    }
  });

  return result;
};

export const isset = (input: any, _def?: any): boolean => {
  return input !== undefined && input !== null;
};

export const getDefault = (input: any, def: any = null): any => {
  return isset(input) ? input : def;
};

export function equalsIgnoringCase(text1: string, text2: string) {
  return text1.localeCompare(text2, undefined, { sensitivity: 'accent' }) === 0;
}

export function secondsToDayHourMinuteFormat(seconds: number) {
  const days = Math.floor(seconds / (3600 * 24));
  const hour = Math.floor((seconds % (3600 * 24)) / 3600);
  const minute = Math.floor((seconds % 3600) / 60);

  const dDisplay = days > 0 ? days + ' hari ' : '';
  const hDisplay = hour > 0 ? hour + ' jam ' : '';
  const mDisplay = minute > 0 ? minute + ' menit' : '';

  return dDisplay + hDisplay + mDisplay;
}

export function convertUserLastLogin(date: any) {
  const days = Math.floor(date / (3600 * 24));
  const hour = Math.floor((date % (3600 * 24)) / 3600);
  const minute = Math.floor((date % 3600) / 60);

  const dDisplay = days > 0 ? days + ' hari ' : '';
  const hDisplay = hour > 0 ? hour + ' jam ' : '';
  const mDisplay = minute > 0 ? minute + ' menit' : '';

  return dDisplay + hDisplay + mDisplay;
}

export function isJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }

  return true;
}

export function generateFilterQuery(inputs: object) {
  const keys = Object.keys(inputs);

  return keys.reduce((query, key) => {
    if (query !== '') query += 'AND ';
    query += `${key} = :${key} `;
    return query;
  }, '');
}
