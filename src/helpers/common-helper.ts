export const isset = (input: any, _def?: any): boolean => {
  return input !== undefined && input !== null;
};

export const getDefault = (input: any, def: any = null): any => {
  return isset(input) ? input : def;
};
