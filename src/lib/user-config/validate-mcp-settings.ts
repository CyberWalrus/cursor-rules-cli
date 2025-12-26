import type { McpSettings } from '../../model/types/main';

/** Список обязательных полей MCP настроек */
const REQUIRED_FIELDS: Array<keyof McpSettings> = ['apiKey', 'aiModel'];

/** Проверяет заполненность всех обязательных полей MCP настроек */
export function validateMcpSettings(mcpSettings: McpSettings | null | undefined): {
    isValid: boolean;
    missingFields: Array<keyof McpSettings>;
} {
    if (mcpSettings === null || mcpSettings === undefined) {
        return {
            isValid: false,
            missingFields: REQUIRED_FIELDS,
        };
    }

    const missingFields: Array<keyof McpSettings> = [];

    for (const field of REQUIRED_FIELDS) {
        const value = mcpSettings[field];

        if (value === null || value === undefined || value === '') {
            missingFields.push(field);
        }
    }

    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
}
