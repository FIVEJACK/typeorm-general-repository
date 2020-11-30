import GeneralRule from 'Validators/general-rule';

export default class CastInputHelper {
  public static async castType(inputs: object) {
    const fieldTypes = GeneralRule.fieldTypes;

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        let thisType = 'string';
        if (fieldTypes[key] !== undefined) {
          thisType = fieldTypes[key];
        }

        const value = inputs[key];
        if (value instanceof Array) {
          const tempArray = [];
          for (const arrayKey in value) {
            const arrayValue = value[arrayKey];
            if (thisType === 'number' && !isNaN(arrayValue)) {
              tempArray.push(+arrayValue);
            } else if (thisType === 'boolean') {
              if (arrayValue === 'true' || arrayValue === true || arrayValue === 1 || arrayValue === '1') {
                tempArray.push(true);
              } else if (arrayValue === 'false' || arrayValue === false || arrayValue === 0 || arrayValue === '0') {
                tempArray.push(false);
              } else {
                tempArray.push(arrayValue);
              }
            } else {
              const newValue = typeof arrayValue == 'string' ? arrayValue.trim() : arrayValue;
              tempArray.push(newValue);
            }
          }
          inputs[key] = tempArray;
        } else {
          if (thisType === 'number' && !isNaN(inputs[key])) {
            inputs[key] = +value;
          } else if (thisType === 'boolean') {
            if (value === 'true' || value === true || value === 1 || value === '1') {
              inputs[key] = true;
            } else if (value === 'false' || value === false || value === 0 || value === '0') {
              inputs[key] = false;
            }
          } else {
            inputs[key] = typeof value == 'string' ? value.trim() : value;
          }
        }
      }
    }
  }
}
