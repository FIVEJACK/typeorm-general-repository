import { validate } from 'class-validator';

export default class ValidatorHelper {
  public static async validate(inputs: object, modelObject: object) {
    inputs = JSON.parse(JSON.stringify(inputs)); // change inputs into standard javascript object
    const result = {
      success: true,
      message: undefined,
    };

    for (const key in inputs) {
      if (inputs.hasOwnProperty(key)) {
        const value = inputs[key];
        modelObject[key] = value;
      }
    }

    const valid = await validate(modelObject, { skipMissingProperties: false });
    if (valid.length > 0) {
      result.success = false;

      const message = {};
      valid.forEach((entry) => {
        const errorMessages = [];
        for (const key in entry.constraints) {
          if (entry.constraints.hasOwnProperty(key)) {
            errorMessages.push(entry.constraints[key]);
          }
        }
        message[entry.property] = errorMessages;
      });
      result.message = message;
    }

    return result;
  }
}
