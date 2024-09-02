import { isNumberString, ValidateBy, ValidationOptions } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';

const IS_TYPE = 'isType';

export function IsType(
  types: Array<
    | 'string'
    | 'string-number'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function'
    | null
  >,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_TYPE,
      validator: {
        validate: (value: unknown) => {
          if (types.includes('string-number') && typeof value === 'string') {
            return isNumberString(value) || types.includes('string');
          }
          return types.includes(typeof value);
        },
        defaultMessage: ({ value }: ValidationArguments) =>
          `Current type ${typeof value} is not in [${types.join(', ')}]`
      }
    },
    validationOptions
  );
}
