import { bold, cyan, green, red, yellow } from 'picocolors';

import { compareVersions } from './compare-versions';
import { getNpmVersion } from './get-npm-version';

/** Форматирует строку с префиксом и суффиксом до ровной ширины */
function formatBoxLine(content: string, width: number, prefix: string, suffix: string): string {
    const contentWidth = width - prefix.length - suffix.length;
    const padding = Math.max(0, contentWidth - content.length);

    return `${prefix}${content}${' '.repeat(padding)}${suffix}`;
}

/** Проверяет и уведомляет о доступной новой версии */
export async function notifyIfUpdateAvailable(packageName: string, currentVersion: string): Promise<void> {
    try {
        const latestVersion = await getNpmVersion(packageName);
        const comparison = compareVersions(currentVersion, latestVersion);

        if (comparison.changeType === 'none') {
            return;
        }

        const boxWidth = 49;

        console.log('');
        console.log(yellow('╭─────────────────────────────────────────────╮'));
        console.log(formatBoxLine(`${bold('Update available!')}`, boxWidth, yellow('│ '), ` ${yellow('│')}`));
        console.log(formatBoxLine('', boxWidth, yellow('│ '), ` ${yellow('│')}`));

        const versionLine = `${red(currentVersion)} → ${green(latestVersion)}`;
        console.log(formatBoxLine(versionLine, boxWidth, yellow('│ '), ` ${yellow('│')}`));

        console.log(formatBoxLine('', boxWidth, yellow('│ '), ` ${yellow('│')}`));
        console.log(
            formatBoxLine(`Run ${cyan('npm i -g cursor-rules-cli@latest')}`, boxWidth, yellow('│ '), ` ${yellow('│')}`),
        );
        console.log(
            formatBoxLine(`or  ${cyan('yarn global add cursor-rules-cli')}`, boxWidth, yellow('│ '), ` ${yellow('│')}`),
        );
        console.log(yellow('╰─────────────────────────────────────────────╯'));
        console.log('');
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.debug('Failed to notify about update:', err);
        }
    }
}
