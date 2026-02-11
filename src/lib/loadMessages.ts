// lib/loadMessages.ts
import { readFile } from 'fs/promises';
import path from 'path';

export async function loadMessages(locale: string, namespaces: string[] = []) {
    const basePath = path.join(process.cwd(), 'src/messages', locale);

    const results = await Promise.all(
        namespaces.map(ns => readFile(path.join(basePath, `${ns}.json`), 'utf8'))
    );

    return results.reduce((acc, content) => ({ ...acc, ...JSON.parse(content) }), {});
}
