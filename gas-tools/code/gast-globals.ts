import * as url from 'url';
import path from 'node:path';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * The root of the project gas-tools.
 */
export const GAST_ROOT:string = path.resolve(__dirname,'..');

/**
 * The root of the repository.
 */
export const REP_ROOT:string = path.resolve(GAST_ROOT,'..');
