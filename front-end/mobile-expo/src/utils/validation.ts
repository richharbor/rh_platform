/**
 * Validation utilities for form inputs
 */

export const validateEmail = (email: string): string | undefined => {
    if (!email || email.trim() === '') {
        return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }

    // Check for common typos in TLDs
    const commonTypos = ['.con', '.cpm', '.coM', '.comm'];
    if (commonTypos.some(typo => email.toLowerCase().endsWith(typo))) {
        return 'Did you mean .com?';
    }

    return undefined;
};

export const validatePhone = (phone: string): string | undefined => {
    if (!phone || phone.trim() === '') {
        return 'Phone number is required';
    }

    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length !== 10) {
        return 'Phone number must be exactly 10 digits';
    }

    // Check if it starts with a valid Indian mobile prefix (6-9)
    if (!/^[6-9]/.test(digitsOnly)) {
        return 'Phone number must start with 6, 7, 8, or 9';
    }

    return undefined;
};

export const validateName = (name: string): string | undefined => {
    if (!name || name.trim() === '') {
        return 'Name is required';
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
        return 'Name must be at least 2 characters';
    }

    if (trimmedName.length > 100) {
        return 'Name must not exceed 100 characters';
    }

    // Allow letters, spaces, dots, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s.\-']+$/;
    if (!nameRegex.test(trimmedName)) {
        return 'Name can only contain letters, spaces, dots, and hyphens';
    }

    return undefined;
};

export const validateCity = (city: string): string | undefined => {
    if (!city || city.trim() === '') {
        return 'City is required';
    }

    const trimmedCity = city.trim();

    if (trimmedCity.length < 2) {
        return 'City must be at least 2 characters';
    }

    // Allow letters, spaces, commas, and hyphens
    const cityRegex = /^[a-zA-Z\s,\-]+$/;
    if (!cityRegex.test(trimmedCity)) {
        return 'City can only contain letters, spaces, commas, and hyphens';
    }

    return undefined;
};

export const validateAge = (age: string): string | undefined => {
    if (!age || age.trim() === '') {
        return undefined; // Age may not be required in all cases
    }

    const ageNum = parseInt(age, 10);

    if (isNaN(ageNum)) {
        return 'Age must be a number';
    }

    if (age.length > 2) {
        return 'Age must be 2 digits or less';
    }

    if (ageNum < 1 || ageNum > 99) {
        return 'Age must be between 1 and 99';
    }

    return undefined;
};

/**
 * Validate a field based on its configuration
 */
export const validateField = (
    fieldId: string,
    value: any,
    required: boolean = false
): string | undefined => {
    // Skip validation if not required and empty
    if (!required && (!value || value.toString().trim() === '')) {
        return undefined;
    }

    switch (fieldId) {
        case 'email':
            return validateEmail(value);
        case 'mobile':
            return validatePhone(value);
        case 'clientName':
            return validateName(value);
        case 'location':
            return validateCity(value);
        case 'age':
            return validateAge(value);
        default:
            // Generic required check for other fields
            if (required && (!value || value.toString().trim() === '')) {
                return 'This field is required';
            }
            return undefined;
    }
};
