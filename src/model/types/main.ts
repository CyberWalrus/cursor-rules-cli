/** Тип команды CLI */
export type CommandType = 'config' | 'init' | 'replace-all' | 'set-global-rule' | 'set-mcp-server' | 'upgrade';

/** Тип действия интерактивного меню */
export type InteractiveMenuAction =
    | 'config'
    | 'exit'
    | 'init'
    | 'replace-all'
    | 'set-global-rule'
    | 'set-mcp-server'
    | 'upgrade';

/** Конфигурация правил */
export type RulesConfig = {
    /** Версия CLI тулзы */
    cliVersion: string;
    /** Версия формата конфигурации */
    configVersion: string;
    /** Дата установки */
    installedAt: string;
    /** Версия промптов */
    promptsVersion: string;
    /** Наборы правил */
    ruleSets: RuleSet[];
    /** Настройки */
    settings: {
        /** Язык вывода сообщений */
        language: 'en' | 'ru';
    };
    /** Источник правил */
    source: string;
    /** Дата последнего обновления */
    updatedAt: string;
    /** Переопределения YAML параметров для файлов */
    fileOverrides?: FileOverride[];
    /** Список файлов для игнорирования */
    ignoreList?: string[];
    /** Версия правил (deprecated, используйте promptsVersion) */
    version?: string;
};

/** Набор правил */
export type RuleSet = {
    /** Идентификатор набора */
    id: string;
    /** Обновлять ли этот набор */
    update: boolean;
    /** Зафиксированная версия (опционально) */
    fixedVersion?: string;
};

/** Переопределение параметров файла */
export type FileOverride = {
    /** Путь к файлу (относительно .cursor/) */
    file: string;
    /** YAML параметры для переопределения */
    yamlOverrides: Record<string, unknown>;
};

/** Результат сравнения версий */
export type VersionComparison = {
    /** Тип изменения */
    changeType: 'major' | 'minor' | 'none' | 'patch';
    /** Текущая версия */
    current: string;
    /** Целевая версия */
    target: string;
};

/** Diff между версиями */
export type VersionDiff = {
    /** Файлы для добавления */
    toAdd: string[];
    /** Файлы для удаления */
    toDelete: string[];
    /** Файлы для обновления */
    toUpdate: string[];
};

/** Карта путей файлов и их хешей */
export type FileHashMap = Map<string, string>;

/** Параметры для функции проверки и обновления */
export type CheckAndUpdateOptions = {
    /** Перезапускать процесс после обновления (по умолчанию: true) */
    isRespawn?: boolean;
    /** Пропустить автоматическое обновление */
    isSkipUpdate?: boolean;
};

/** Глобальная конфигурация пользователя */
export type UserConfig = {
    /** Дополнительные настройки */
    [key: string]: unknown;
    /** Язык интерфейса */
    language: 'en' | 'ru';
};

/** Переменные для подстановки в шаблон meta-info.template.md */
export type TemplateVariables = {
    /** Возраст */
    AGE?: string;
    /** Стиль общения */
    COMMUNICATION_STYLE?: string;
    /** Текущая дата */
    CURRENT_DATE?: string;
    /** Устройство */
    DEVICE?: string;
    /** Язык */
    LANGUAGE?: string;
    /** Местоположение */
    LOCATION?: string;
    /** Имя пользователя */
    NAME?: string;
    /** Операционная система */
    OS?: string;
    /** Роль */
    ROLE?: string;
    /** Технологический стек */
    STACK?: string;
    /** Версии инструментов */
    TOOL_VERSIONS?: string;
};

/** Конфигурация MCP сервера */
export type McpServerConfig = {
    /** Команда запуска */
    command: string;
    /** Аргументы команды */
    args?: string[];
    /** Переменные окружения */
    env?: Record<string, string>;
};

/** Конфигурация MCP серверов */
export type McpConfig = {
    /** MCP серверы */
    mcpServers: Record<string, McpServerConfig>;
};

/** Параметры для команды установки глобального правила */
export type GlobalRuleParams = {
    /** Имя файла правила */
    ruleName: string;
    /** Переменные для подстановки */
    variables: TemplateVariables;
};

/** Правило пользователя Cursor */
export type UserRule = {
    /** Содержимое правила */
    content: string;
    /** Имя правила */
    name: string;
};

/** Настройки пользователя Cursor */
export type CursorUserSettings = {
    /** Дополнительные настройки */
    [key: string]: unknown;
    /** Правила пользователя Cursor */
    'cursor.userRules'?: UserRule[];
};
