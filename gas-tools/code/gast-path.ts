import * as fs from 'node:fs/promises'
import path from 'node:path'

import log from "./gast-log.js"
import "./gast-utils.js"

/**
 * 
 * @param build_dir 
 * @param cbk 
 */
export async function delete_all_files(dir: AbsolutePath, cbk: ((file: string) => void) | null = null, recursive: boolean = false) {
  try {
    (await fs.readdir(dir, { encoding: 'utf8', withFileTypes: true, recursive: recursive })).forEach(
      async (dirent) => {
        try {
          if (dirent.isFile()) {
            const file = dirent.name;
            await fs.unlink(path.resolve(dir, file));
            if (cbk)
              cbk(file);
          }
        } catch (e: any) {
          log.error(`Cannot delete file in directory: ${dir} (Error:${e.message})`)
        }
      }
    )
  } catch (e: any) {
    log.warn(`Cannot read directory: ${dir} (Error:${e.message})`)
  }
}
/**
* list sub-directories of {@link root} with name {@link name}. 
* Only sub-directories listed in {@link from} are examined if specified.
* Otherwise all sub-directories are examined.
* @param root 
* @param name 
* @param from 
* @returns 
*/
export async function list_subdirectories_with_name(root: string, name: string = '.*') {
  const nameExp = new RegExp(name);
  return (await fs.readdir(root, { encoding: 'utf8', withFileTypes: true }))
    .filter(z => z.isDirectory() && nameExp.test(z.name))
    .map(d => path.resolve(root, d.name))
}

/**
 * Checks if a path is a directory
 * @param p 
 * @returns 
 */
export const is_dir = (p: string): Boolean => p.endsWith(path.sep)

/**
 * Ensures that a path is a directory
 * @param p 
 * @returns 
 */
export const dir = (p: string): string => (is_dir(p)) ? p : `${p}${path.sep}`
/**
 * 
 * @param dir 
 * @returns 
 */
export const list_files = async (dir: AbsolutePath, cbk: (file: string) => Boolean) => {

  if (dir)
    return (await fs.readdir(dir))
      .filter(cbk);
  else
    return [] as Array<string>
}
/**
 * 
 * @param srcs 
 * @param dst_dir 
 */
export const copy_files = async (srcs: Array<Src>, dst_dir: AbsolutePath, cbk: ((file: string, src_dir: string, dst_dir: string) => void) | null = null) => {
  srcs.forEach(
    ({ src_dir, files }) => files.forEach(
      async (file: string) => {
        await fs.copyFile(path.resolve(src_dir, file), path.resolve(dst_dir, file));
        if (cbk)
          cbk(file, src_dir, dst_dir);
      }
    )
  );
}
/**
 * Applies path.basename n times.
 * @param root 
 * @param n 
 * @param acc 
 * @returns 
 */
export const basename_n = (root: AbsolutePath, n: number, acc: string = ""): string => {
  if (n === 0)
    return acc;
  else {
    acc = path.basename(root) + path.sep + acc;
    return basename_n(path.dirname(root), n - 1, acc);
  }
}
/**
 * Applies path.basename n times
 * @param root 
 * @param n 
 * @param acc 
 * @returns 
 */
export const extname_n = (root: AbsolutePath, n: number): string => {
  const ext = path.extname(root);
  if (n === 1)
    return ext;
  else {
    return extname_n(root.replace(new RegExp(ext + '$'), ""), n - 1);
  }
}
/**
 * 
 * @param p1 
 * @param p2 
 * @returns 
 */
export const common_path = (p1: string, p2: string) => {
  //split input paths
  const ps = (p: string) => p.split(path.sep);
  //split input paths and zip
  let pairs = ps(p1).zip(ps(p2));
  //find first non-matching pair
  const max = pairs.findIndex(([x, y]) => x !== y);
  if (max !== -1)
    pairs = pairs.slice(0, max);
  // create path
  return dir(
    pairs.reduce((acc, [p, _]) => path.resolve(acc, p), "/")
  );
}
/**
 * 
 * @param ps 
 * @returns 
 */
export const common_paths = (...ps: Array<string>) => {
  if (ps.length === 0) {
    return "";
  } else if (ps.length === 1) {
    return ps[0];
  } else if (ps.length === 2) {
    return common_path(ps[0], ps[1]);
  }
  else
    return ps.slice(2).reduce((acc, p) => common_path(acc, p), common_path(ps[0], ps[1]));
}

export async function file_exists(p: AbsolutePath) {

  try {
    const ret = await fs.access(p, fs.constants.R_OK | fs.constants.W_OK);
    if (ret === undefined) return true;
  } catch {
    log.warn(`${p} does not exist.`);
  }
  return false;
}