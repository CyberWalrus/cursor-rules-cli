import { spawn } from 'node:child_process';

/** Перезапускает CLI процесс для загрузки новой версии кода */
export function respawnProcess(): void {
    const args = process.argv.slice(1);

    spawn(process.argv[0], args, {
        detached: true,
        stdio: 'inherit',
    });

    process.exit(0);
}
