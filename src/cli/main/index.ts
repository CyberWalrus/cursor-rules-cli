import { defineCommand, runMain } from 'citty';
import { fileURLToPath } from 'node:url';

import { t } from '../../lib/i18n';
import { configCommand } from '../commands/config';
import { initCommand } from '../commands/init';
import { replaceAllCommand } from '../commands/replace-all';
import { setGlobalRuleCommand } from '../commands/set-global-rule';
import { setMcpServerCommand } from '../commands/set-mcp-server';
import { upgradeCommand } from '../commands/upgrade';
import { ensureLatestVersion } from './ensure-latest-version';
import { getPackageDir } from './get-package-dir';
import { getTargetDir } from './get-target-dir';
import { showInteractiveMenu } from './interactive-menu';

const currentFilePath = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const packageDir = getPackageDir(currentFilePath);

/** Главная команда CLI */
const main = defineCommand({
    meta: {
        description: 'CLI tool for managing .cursor rules in projects',
        name: 'cursor-rules',
        version: '0.1.3',
    },
    subCommands: {
        config: defineCommand({
            meta: {
                description: 'Configure global settings',
                name: 'config',
            },
            /** Запускает настройку глобальной конфигурации */
            async run(): Promise<void> {
                await configCommand();
            },
        }),
        init: defineCommand({
            meta: {
                description: 'Initialize .cursor rules in the project',
                name: 'init',
            },
            /** Запускает инициализацию .cursor правил */
            async run(): Promise<void> {
                const targetDir = getTargetDir();
                await initCommand(packageDir, targetDir);
                console.log(t('cli.main.init.success'));
            },
        }),
        'replace-all': defineCommand({
            meta: {
                description: 'Replace all .cursor rules with the latest version',
                name: 'replace-all',
            },
            /** Запускает полную замену .cursor правил */
            async run(): Promise<void> {
                const targetDir = getTargetDir();
                await replaceAllCommand(packageDir, targetDir);
                console.log(t('cli.main.replace-all.success'));
            },
        }),
        'set-global-rule': defineCommand({
            meta: {
                description: 'Add or update global Cursor rule',
                name: 'set-global-rule',
            },
            /** Запускает установку глобального правила */
            async run(): Promise<void> {
                await setGlobalRuleCommand();
            },
        }),
        'set-mcp-server': defineCommand({
            meta: {
                description: 'Add or update MCP server configuration',
                name: 'set-mcp-server',
            },
            /** Запускает установку MCP сервера */
            async run(): Promise<void> {
                await setMcpServerCommand();
            },
        }),
        upgrade: defineCommand({
            meta: {
                description: 'Upgrade .cursor rules to the latest version',
                name: 'upgrade',
            },
            /** Запускает обновление .cursor правил */
            async run(): Promise<void> {
                const targetDir = getTargetDir();
                await upgradeCommand(packageDir, targetDir);
                console.log(t('cli.main.upgrade.success'));
            },
        }),
    },
});

/** Запускает CLI приложение */
export async function runCli(): Promise<void> {
    if (packageDir === null || packageDir === undefined) {
        throw new Error(t('cli.main.package-dir-not-found'));
    }

    ensureLatestVersion(packageDir).catch((error) => {
        const message: string = error instanceof Error ? error.message : String(error);
        console.warn(t('cli.main.update-check.failed', { message }));
    });

    if (process.argv.length <= 2) {
        await showInteractiveMenu(currentFilePath);

        return;
    }

    await runMain(main);
}
