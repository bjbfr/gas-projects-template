import path from 'node:path'
import * as fs from 'node:fs/promises'
import ts from 'typescript'

import log from "./gast-log.js"
import { read_tsconfig, build_dirs, references } from "./gas-tsc-config.js"
import { list_files, copy_files, delete_all_files, common_paths, basename_n, extname_n, file_exists } from "./gast-path.js"
import { REP_ROOT } from "./gast-globals.js"
import { exists, read_json, write_json, get } from "./gast-utils.js"
import { clasp_init } from "./gast-clasp.js"
import { exec_command, exec_file } from "./gast-childprocess.js"

/**
 * Gives relative from the root for path {@link p}
 * @param p {string}
 * @returns void
 */
const from_repRoot = (p: string) => path.relative(REP_ROOT, p)
/**
 * 
 * @param inputs 
 * @param dst_dir 
 */
const do_copy = async (inputs: Array<{ src_dirs: Array<AbsolutePath>, file_cbk: (file: string) => boolean }>, dst_dir: AbsolutePath) => {
  const rel_dst = from_repRoot(dst_dir);
  inputs.forEach(
    async ({ src_dirs, file_cbk }) => {

      //files
      const src_files: Array<Src> = (
        await Promise.all(
          src_dirs.map(
            async (dir) => {
              if (dir)
                return { src_dir: dir, files: await list_files(dir, file_cbk) }
            })
        )
      )
        .filter(exists)
        .flat() as Array<Src>; // filter undefined

      //copy files
      copy_files(src_files, dst_dir, (file, src_dir, _) => log.info(`> copy ${file} from ${from_repRoot(src_dir)} to ${rel_dst}`, 'do_copy'))

    }
  )
}
/**
 * 
 * @param tsconfig 
 * @param current 
 * @returns 
 */
function build_dir(tsconfig: ts.ParsedCommandLine, current: string) {
  // find build directory
  const dst_dirs = build_dirs(tsconfig);
  if (!dst_dirs) {
    log.warn(`Cannot find build dir for ${current}`);
    return;
  }

  const dst_dir = (dst_dirs.length > 1) ? common_paths(...dst_dirs) : dst_dirs[0];
  return dst_dir;
}
/**
 * 
 * @param root 
 */
export async function copy_deps(root: AbsolutePath) {
  try {
    const current = from_repRoot(root);
    log.info(`Copy of dependencies for ${current}`);
    //read tsconfig  
    const tsconfig = read_tsconfig(root);
    if (!tsconfig) {
      log.warn(`Cannot read tsconfig for ${current}`);
      return;
    }
    //dst_dir 
    const dst_dir = build_dir(tsconfig, current);
    if (!dst_dir) return;

    // find references
    const refs = references([tsconfig]).unique();// remove duplicate ref

    if (refs.length === 0) {
      log.info(`No dependency to be copied.`);
      return;
    }
    //files to be copied ...
    // src directories
    const src_dirs = refs.map(ref => {
      const tsconfig = read_tsconfig(ref);
      if (tsconfig)
        return build_dirs(tsconfig);
      return;
    })
      .filter(exists)
      .flat() as Array<string>;

    // copy .js files associated with references and local appscript.json if any
    do_copy(
      [
        { src_dirs: src_dirs, file_cbk: (file: string) => path.extname(file) === '.js' && extname_n(file, 2) != '.test' }, // only js and prevent copy of test files of dependencies
        { src_dirs: [root], file_cbk: (file: string) => path.basename(file) === 'appsscript.json' }
      ],
      dst_dir
    )

  } catch (e: any) {
    log.error(`Unhandled exception: ${e.message}`)
  }

  return;
}
/**
 * 
 * @param root 
 */
export async function clean_all(root: AbsolutePath) {

  try {
    const current = from_repRoot(root);
    log.info(`Clean build directory for ${current}`);
    const tsconfig = read_tsconfig(root);
    if (tsconfig) {
      const dst_dirs = build_dirs(tsconfig);
      if (dst_dirs)
        await Promise.all(
          dst_dirs.map(
            dst_dir => {
              delete_all_files(dst_dir, (file) => log.verbose(`delete file: ${file}.`, 'clean_all'));
              log.info(`Cleaning of ${from_repRoot(dst_dir)} done.`, 'clean_all')
            }
          )
        );
      else
        log.warn(`Cannot find build dir for ${current}`);
    } else {
      log.warn(`Cannot find tsconfig for ${current}.`);
    }
  } catch (e: any) {
    log.error(`Unhandled exception: ${e.message}`);
  }

  return;
}
/**
 * 
 * @param libname 
 */
export async function init_lib(libname: string) {
  init_(libname, "lib");
}
/**
 * 
 * @param projectname 
 */
export async function init_project(projectname: string) {
  init_(projectname, "project");
}
const TEMPLATE_SCRIPT = "init_template.sh";
const TEMPLATE = path.resolve(REP_ROOT, 'templates', TEMPLATE_SCRIPT);
/**
 * 
 * @param name 
 * @param artefactType 
 * @returns 
 */
async function init_(name: string, artefactType: ArtefactType) {

  const p = path.resolve(REP_ROOT, "src", `${artefactType}s`, name);
  // check if the target directory does not already exist
  try {
    await fs.access(p, fs.constants.F_OK);
    log.info(`${artefactType == "lib" ? "Library" : "Project"}: '${name}' already exists.`, `init_${artefactType}`);
    return;
  } catch { }

  //create the new directory
  try {
    await fs.mkdir(p);
  } catch (e: any) {
    log.error(`Cannot create ${p} (Error:${e.message})`)
    return;
  }

  try {
    // execute template in newly created directory
    const { stdout: templating } = await exec_file(TEMPLATE, [name], p,true);

    if (templating) {
      log.info(templating, `init_${artefactType}`);

      // clasp initialisation
      do_clasp_init(p, artefactType, name)
    }
  } catch (e: any) {
    log.error(e.message.trim(), `init_${artefactType}`)
  }
  return;
}
/**
 * 
 * @param p 
 * @param artefactType 
 * @param name 
 */
async function do_clasp_init(p: AbsolutePath, artefactType: ArtefactType, name: string) {
  //clasp initialisation
  const cloned_files = await clasp_init(p, artefactType, name);
  // move *.js cloned files to code/ if any
  if (cloned_files) {
    const mv_cloned_files = cloned_files.filter(x => path.extname(x) === '.js')
      .map(x => `mv ${path.basename(x)} ./code/`);
    if (mv_cloned_files.length > 0) {
      const { stderr: copy_error } = await exec_command(mv_cloned_files.join(' && '), p, true);
      if (!copy_error) log.info('Cloned files from AppScript Project copied.');
    }
  }
  update_clasp(p);
}
/**
 * 
 * @param root 
 * @returns 
 */
export async function update_clasp(root: AbsolutePath) {

  update_clasp_config(root);

  update_appscript_config(root);

}
/**
 * 
 * @param root 
 */
async function update_appscript_config(root: AbsolutePath) {
  //appscript.json
  const appscript_path = path.resolve(root, 'appsscript.json')
  const appscript_exists = await file_exists(appscript_path);
  if (appscript_exists) {

    let modified = false;
    const appscript = await read_json(appscript_path);
    const access = get(appscript, "executionApi.access")
    if (access !== "ANYONE") {
      appscript["executionApi"] = { "access": "ANYONE" };
      modified = true;
    }
    const timeZone = get(appscript, "timeZone");
    if (timeZone !== "Europe/Paris") {
      appscript["timeZone"] = "Europe/Paris";
      modified = true;
    }
    if (modified)
      await write_json(appscript_path, appscript);
  }
}
/**
 * 
 * @param root 
 */
async function update_clasp_config(root: AbsolutePath) {
  //read .clasp.json
  const clasp_path = path.resolve(root, '.clasp.json');
  const exists = await file_exists(clasp_path);
  if (exists) {

    let clasp_json = await read_json(clasp_path);
    let modified = false;

    //update rootDir in .clasp,json
    const tsconfig = read_tsconfig(root);
    if (tsconfig) {
      const dst_dir = build_dir(tsconfig, from_repRoot(root));
      if (dst_dir) {
        const rootDir = path.relative(root, dst_dir);
        clasp_json.rootDir = rootDir;
        modified = true;
      }
    }

    //update projectId in .clasp,json
    const cloud_path = path.resolve(REP_ROOT, 'cloud.json');
    const cloud_exists = await file_exists(cloud_path);
    if (cloud_exists) {
      const cloud = await read_json(cloud_path);
      if (cloud) {
        const projectId = get(cloud, "gcp.projectId");
        if (projectId) {
          clasp_json.projectId = get(cloud, "gcp.projectId");
          modified = true;
        }
      }
    }

    // update .clasp.json if modified
    if (modified)
      await write_json(clasp_path, clasp_json);
  }
}
/**
 * 
 * @param root 
 */
export async function init_clasp(root: AbsolutePath) {
  const name = basename_n(root, 1);
  const artefactType = basename_n(root, 2).replace('s', '') as ArtefactType;
  try {
    await do_clasp_init(root, artefactType, name)
  } catch (e: any) {
    log.error(e.message)
  }
}