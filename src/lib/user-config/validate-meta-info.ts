import type { UserMetaInfo } from '../../model/types/main';

/** Список обязательных полей метаинформации */
const REQUIRED_FIELDS: Array<keyof UserMetaInfo> = [
    'name',
    'age',
    'role',
    'stack',
    'toolVersions',
    'os',
    'device',
    'location',
    'language',
    'communicationStyle',
];

/** Проверяет заполненность всех обязательных полей метаинформации */
export function validateMetaInfo(metaInfo: UserMetaInfo | null | undefined): {
    isValid: boolean;
    missingFields: Array<keyof UserMetaInfo>;
} {
    if (metaInfo === null || metaInfo === undefined) {
        return {
            isValid: false,
            missingFields: REQUIRED_FIELDS,
        };
    }

    const missingFields: Array<keyof UserMetaInfo> = [];

    for (const field of REQUIRED_FIELDS) {
        const value = metaInfo[field];

        if (value === null || value === undefined || value === '') {
            missingFields.push(field);
        }
    }

    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
}
