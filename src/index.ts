#!/usr/bin/env node
import { runCli } from './cli/main/index';
import { initI18n, t } from './lib/i18n';

/** Инициализирует и запускает CLI приложение */
export async function main(): Promise<void> {
    await initI18n();

    try {
        await runCli();
    } catch (error: unknown) {
        const message: string = error instanceof Error ? error.message : String(error);
        console.error(t('cli.error', { message }));
        process.exit(1);
    }
}

main().catch((error: unknown) => {
    const message: string = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
});
