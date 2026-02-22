import { validateObject, type ValidationErrors } from "$lib/object-validator";
import type { Fetch } from "$lib/types";
import { cyrb53, Err, fetchIntoResult, Ok, Result } from "$lib/utils";
import { Validator } from "$lib/validator";
import type { PasswordUpdatePayload, PasswordUpdate } from "./models";

export const accountClient = (fetch: Fetch) => {
    return {
        patchPassword: async (payload: PasswordUpdatePayload) => {
            return fetchIntoResult<string>(() => fetch('/api/auth/user/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }));
        }
    }
}

export const accountService = {
    getPatchPasswordPayload: (formData: FormData): Result<PasswordUpdatePayload, ValidationErrors<PasswordUpdate>> => {
        const form: PasswordUpdate = {
            currentPassword: formData.get('current_password'),
            newPassword: formData.get('new_password'),
            confirmPassword: formData.get('confirm_password')
        };
        const validators = {
            currentPassword: Validator.string('current_password').required().nonEmpty(),
            newPassword: Validator.string('new_password').required().nonEmpty().withMinSize(8),
            confirmPassword: Validator.string('confirm_password')
                .required()
                .equal(formData.get('new_password')?.toString() ?? '', 'new_password')
        };
        const formErrors = validateObject(form, validators);
        const hasErrors = Object.values(formErrors).some((errors) => errors.length > 0);
        if (hasErrors) {
            return new Err(formErrors);
        }
        const payload: PasswordUpdatePayload = {
            current_password: cyrb53((formData.get('current_password') as string) ?? '').toString(),
            new_password: cyrb53((formData.get('new_password') as string) ?? '').toString()
        };

        return new Ok(payload);
    }
}