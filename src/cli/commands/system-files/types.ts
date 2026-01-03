/** Результат выполнения команды работы с системными файлами */
export type SystemFilesCommandResult = 'back-to-menu' | 'finish';

/** Тип системного файла для копирования */
export type SystemFileType = 'core-instructions' | 'current-date' | 'mcp-config' | 'meta-info';

/** Действие в меню выбора типа файла */
export type SystemFileMenuAction = SystemFileType | 'back-to-menu' | 'finish';
