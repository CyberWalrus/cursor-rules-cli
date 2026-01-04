/** Кэш версий для фоновой загрузки */
export type VersionsCache = {
    isError: boolean;
    lastCheck: number | null;
    promptsVersion: string | null;
    systemRulesVersion: string | null;
};
