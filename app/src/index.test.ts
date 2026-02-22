import { describe, it, expect } from 'vitest';
import { Validator } from './lib/validator';
import { type ValidationSchema, validateObject } from '$lib/object-validator';

describe('validateObject', () => {
    it('should return an empty object if the object is valid', () => {
        const obj = {
            name: 'John Doe',
            age: 30,
        };

        const schema: ValidationSchema<typeof obj> = {
            name: Validator.string("name").required(),
            age: Validator.number("age").required().isPositive(),
        };

        const errors = validateObject(obj, schema);

        expect(errors).toEqual({
            name: [], age: []
        });
    });

    it('should return an object with errors if the object is invalid', () => {
        const obj = {
            name: '',
            age: -1,
        };

        const schema: ValidationSchema<typeof obj> = {
            name: Validator.string("name").required().nonEmpty(),
            age: Validator.number("age").required().isPositive(),
        };

        const errors = validateObject(obj, schema);

        expect(errors).toEqual({
            name: ['Name should not be empty'],
            age: ['Age should be positive'],
        });
    });
});
