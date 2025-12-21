#!/usr/bin/env node
import { runCli } from './cli/main/index';
import { initI18n, t } from './lib/i18n';

(async () => {
    await initI18n();

    try {
        await runCli();
    } catch (error: unknown) {
        console.error(t('cli.error', { message: error instanceof Error ? error.message : String(error) }));
        process.exit(1);
    }
})();
