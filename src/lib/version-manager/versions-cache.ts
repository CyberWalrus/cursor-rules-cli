/** Кэш версий для фоновой загрузки */
type VersionsCache = {
    error: boolean;
    lastCheck: number | null;
    promptsVersion: string | null;
    systemRulesVersion: string | null;
};

let cache: VersionsCache = {
    error: false,
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
    return cache.error;
}

/** Сбрасывает флаг ошибки */
export function clearBackgroundError(): void {
    cache.error = false;
}
