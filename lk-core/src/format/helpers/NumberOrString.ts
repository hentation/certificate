import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, isNumber, isString} from "class-validator";

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumberOrString implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        return (typeof value === 'number' && isNumber(value, {allowInfinity: false, allowNaN: false}))
     || (typeof value === 'string' && isString(value));
    }

    defaultMessage(args: ValidationArguments) {
        return '($value) must be number or string';
    }
}