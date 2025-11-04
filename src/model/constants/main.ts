/** Имя файла для хранения информации о версии */
export const VERSION_FILE_NAME = 'rules-version.json';

/** Директории с правилами для копирования */
export const RULES_DIRS = ['.cursor/rules', '.cursor/docs', '.cursor/commands'] as const;

/** URL npm registry */
export const NPM_REGISTRY_URL = 'https://registry.npmjs.org' as const;

/** Timeout для HTTP запросов к npm registry (в миллисекундах) */
export const NPM_REQUEST_TIMEOUT = 5_000 as const;
