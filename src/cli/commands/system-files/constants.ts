import { t } from '../../../lib/i18n';
import type { SystemFileType } from './types';

/** Сообщения об успешном копировании по типам файлов */
export const COPY_MESSAGES: Record<SystemFileType, string> = {
    'core-instructions': t('command.system-files.copied.core-instructions'),
    'current-date': t('command.system-files.copied.current-date'),
    'mcp-config': t('command.system-files.copied.mcp-config'),
    'meta-info': t('command.system-files.copied.meta-info'),
} as const;
