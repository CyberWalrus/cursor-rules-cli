import type { VersionsCache } from './types';

let cache: VersionsCache = {
    isError: false,
    lastCheck: null,
    promptsVersion: null,
    systemRulesVersion: null,
};

/** Получает кэшированные версии */
export function getCachedVersions(): VersionsCache {
    return { ...cache };
}

/** Устанавливает кэшированные версии */
export function setCachedVersions(versions: Partial<VersionsCache>): void {
    cache = {
        ...cache,
        ...versions,
    };
}

/** Проверяет, была ли ошибка при фоновой загрузке */
export function hasBackgroundError(): boolean {
    return cache.isError;
}

/** Сбрасывает флаг ошибки */
export function clearBackgroundError(): void {
    cache.isError = false;
}
