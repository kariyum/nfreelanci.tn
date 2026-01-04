import { Result, snakeToCapital } from './utils';

export abstract class Validator<T, E> {
    abstract validate(s: T | undefined | null): E[];

    static string(field: string): StringValidator {
        return new StringValidator(field);
    }

    static number(field: string): NumberValidator {
        return new NumberValidator(field);
    }

    static stringArray(field: string): StringArrayValidator {
        return new StringArrayValidator(field);
    }
}

export class StringValidator extends Validator<string, string> {
    private validators: StringValidatorType[];
    private field: string;

    constructor(field: string) {
        super();
        this.validators = [];
        this.field = snakeToCapital(field);
    }

    nonEmpty(): StringValidator {
        const nonEmptyValidator: StringValidatorType = (
            s: string | undefined | null
        ): Result<void, string> => {
            if (s == null || s == undefined || s.length > 0) {
                return new Result<void, string>();
            } else {
                return new Result<void, string>(undefined, `${this.field} cannot be empty`);
            }
        };
        this.validators.push(nonEmptyValidator);
        return this;
    }

    withMinSize(minSize: number): StringValidator {
        const minSizeValidator: StringValidatorType = (
            s: string | undefined | null
        ): Result<void, string> => {
            if (!s || s.length >= minSize) {
                return new Result<void, string>();
            } else {
                return new Result<void, string>(
                    undefined,
                    `${this.field} should be at least ${minSize} characters long`
                );
            }
        };
        this.validators.push(minSizeValidator);
        return this;
    }

    withMaxSize(maxSize: number): StringValidator {
        const maxSizeValidator: StringValidatorType = (
            s: string | undefined | null
        ): Result<void, string> => {
            if (!s || s.length <= maxSize) {
                return new Result<void, string>();
            } else {
                return new Result<void, string>(
                    undefined,
                    `${this.field} cannot exceed ${maxSize} characters`
                );
            }
        };
        this.validators.push(maxSizeValidator);
        return this;
    }

    email(): StringValidator {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValidator: StringValidatorType = (
            s: string | undefined | null
        ): Result<void, string> => {
            if (!s) return new Result<void, string>();
            if (emailRegex.test(s)) {
                return new Result<void, string>();
            } else {
                return new Result<void, string>(
                    undefined,
                    "Invalid email"
                );
            }
        };
        this.validators.push(emailValidator);
        return this;
    }

    in(arr: string[]): StringValidator {
        const inValidator: StringValidatorType = (
            s: string | undefined | null
        ): Result<void, string> => {
            if (!s || arr.includes(s)) {
                return new Result<void, string>();
            } else {
                return new Result<void, string>(
                    undefined,
                    `${s} is unknown`
                );
            }
        };
        this.validators.push(inValidator);
        return this;
    }

    equal(other: string, otherField: string): StringValidator {
        const equal: StringValidatorType = (
            s: string | undefined | null
        ): Result<void, string> => {
            if (!s && s === other) {
                return new Result<void, string>();
            } else {
                return new Result<void, string>(undefined, `${this.field} is not equal to ${snakeToCapital(otherField)}`);
            }
        };
        this.validators.push(equal);
        return this;
    }

    required(): StringValidator {
        const required: StringValidatorType = (
            s: string | undefined | null
        ): Result<void, string> => {
            if (s != null && s != undefined) {
                return new Result<void, string>();
            } else
                return new Result<void, string>(undefined, `${this.field} is required`);
        };
        this.validators.push(required);
        return this;
    }

    validate(s: string | undefined | null): string[] {
        const results = this.validators.map((validator) => validator(s));
        const errors = results.map((error) => error.error).filter((error) => error != undefined);
        return errors;
    }
}

export class NumberValidator extends Validator<number, string> {
    private validators: NumberValidatorType[];
    private field: string;
    constructor(field: string) {
        super();
        this.validators = [];
        this.field = field.charAt(0).toUpperCase() + field.slice(1);
    }

    required(): NumberValidator {
        const required: NumberValidatorType = (
            s: number | undefined | null
        ): Result<void, string> => {
            if (s != null && s != undefined) {
                return new Result<void, string>();
            } else
                return new Result<void, string>(undefined, `${this.field} is required`);
        };
        this.validators.push(required);
        return this;
    }

    isPositive(): NumberValidator {
        const positive: NumberValidatorType = (
            n: number | undefined | null
        ): Result<void, string> => {
            if (n == null || n == undefined) {
                return new Result<void, string>();
            }
            if (n != null && n != undefined && n >= 0) {
                return new Result<void, string>();
            }
            return new Result<void, string>(
                undefined,
                `${this.field} should be positive`
            );
        };
        this.validators.push(positive);
        return this;
    }

    validate(s: any): string[] {
        const regex = new RegExp('^[0-9]+$')
        // console.log(regex.test(s.toString()));
        if (s != undefined && s != null && !regex.test(s.toString())) {
            return [`${this.field} must be a number`]
        }
        const value = (s != undefined && s != null) ? parseFloat(s) : s;
        console.log(value);
        const results = this.validators.map((validator) => validator(value));
        const errors = results.map((error) => error.error).filter((error) => error != undefined);
        return errors;
    }
}

export class StringArrayValidator extends Validator<string[], string> {
    private validators: StringArrayValidatorType[];
    private field: string;

    constructor(field: string) {
        super();
        this.validators = [];
        this.field = field.charAt(0).toUpperCase() + field.slice(1);
    }

    nonEmpty() {
        const emptinessCheck: StringArrayValidatorType = (
            arr: string[] | undefined | null
        ): Result<void, string> => {
            console.log("CHECKING ARRAY LENGTH", arr?.length)
            if (arr != null && arr != undefined && arr.length != 0) {
                return new Result<void, string>();
            } else
                return new Result<void, string>(
                    undefined,
                    `${this.field} cannot be empty`
                );
        };
        this.validators.push(emptinessCheck);
        return this;
    }

    maxSize(n: number) {
        const lengthCheck: StringArrayValidatorType = (
            arr: string[] | undefined | null
        ): Result<void, string> => {
            if (arr != null && arr != undefined && arr.length <= n) {
                return new Result<void, string>();
            } else
                return new Result<void, string>(
                    undefined,
                    `${this.field} cannot exceed ${n} elements`
                );
        };
        this.validators.push(lengthCheck);
        return this;
    }

    validate(s: string[] | undefined | null): string[] {
        const results = this.validators.map((validator) => validator(s));
        const errors = results.map((error) => error.error).filter((error) => error != undefined);
        return errors;
    }
}

enum StringValidationError {
    nonEmpty = 'Field cannot be empty',
    InvalidEmail = 'Invalid email',
    LengthLowerThanMin = 'Value is too short',
    LengthGreaterThanMax = 'Value is too long',
    InvalidEnum = 'Invalid entry',
    NotEqual = 'Values are not equal',
    NotDefined = 'Required field'
}

type StringValidatorType = (s: string | null | undefined) => Result<void, string>;
type StringArrayValidatorType = (s: string[] | null | undefined) => Result<void, string>;

enum NumberValidationError {
    NotPositive = 'Not Positive',
    NotDefined = 'Required field'
}

type NumberValidatorType = (s: number | null | undefined) => Result<void, string>;
