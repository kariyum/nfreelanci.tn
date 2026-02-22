import type { ValidationErrors } from "$lib/object-validator";

export interface PasswordUpdatePayload {
    current_password: string,
    new_password: string
}

export interface PasswordUpdate {
    currentPassword: any;
    newPassword: any;
    confirmPassword: any;
}

export interface FormValidation {
    errors: ValidationErrors<PasswordUpdate>;
    hasErrors: boolean;
}