import { mkdir } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { extract } from 'tar';

import { SYSTEM_RULES_TAG_PREFIX } from '../../model';

/** Скачивает и распаковывает системные правила из GitHub */
export async function fetchSystemRulesTarball(repo: string, version: string, targetDir: string): Promise<void> {
    const url = `https://github.com/${repo}/archive/refs/tags/${SYSTEM_RULES_TAG_PREFIX}${version}.tar.gz`;

    const response = await fetch(url);
    if (response.ok === false) {
        throw new Error(`Failed to download system rules: ${response.status}`);
    }

    if (response.body === null) {
        throw new Error('Response body is null');
    }

    await mkdir(targetDir, { recursive: true });

    const nodeStream = Readable.fromWeb(response.body as never);
    await pipeline(
        nodeStream,
        extract({
            C: targetDir,
            strip: 1,
        }),
    );
}
