import ts from 'typescript'
import path from 'node:path'

import log from "./gast-log.js"
import * as utils from "./gast-utils.js"
import { exists } from "./gast-utils.js"

/**
 * 
 * @param dir 
 * @param file 
 * @returns 
 */
export function read_tsconfig(dir: string, file: string = "tsconfig.json") {
    const configFileName = ts.findConfigFile(
        dir,
        ts.sys.fileExists,
        file
    );
    if (configFileName) {
        const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
        const compilerOptions = ts.parseJsonConfigFileContent(
            configFile.config,
            ts.sys,
            path.dirname(configFileName)
        );
        return compilerOptions;
    } else {
        log.warn(`Cannot find tsconfig file in ${dir}`)
    }
}
/**
 * 
 * @param config 
 * @returns 
 */
export function build_dirs(config: ts.ParsedCommandLine) {
    const fileNames = utils.get(config, "fileNames") as Array<AbsolutePath>;
    const rootDir = utils.get(config, "options.rootDir") as AbsolutePath;
    const outDir = utils.get(config, "options.outDir") as AbsolutePath;
    if (fileNames && rootDir && outDir) {
        return fileNames.map((x) => path.dirname(x))
            .unique()
            .map((x) => path.relative(rootDir, x))
            .map(x => path.resolve(outDir, x));
    }
}
/**
 * 
 * @param config 
 * @returns 
 */
export function root_dir(config: ts.ParsedCommandLine) {
    return utils.get(config, "options.rootDir") as AbsolutePath;
}
/**
 * 
 * @param config 
 * @returns 
 */
export function build_artefacts(config: ts.ParsedCommandLine) {
    const fileNames = utils.get(config, "fileNames") as Array<AbsolutePath>;
    const rootDir = utils.get(config, "options.rootDir") as AbsolutePath;
    const outDir = utils.get(config, "options.outDir") as AbsolutePath;
    if (fileNames && rootDir && outDir) {
        return fileNames.reduce(
            (acc, x) => {
                const srcDir = path.dirname(x);
                const dir_ = path.resolve(outDir, path.relative(rootDir, srcDir));
                const file = path.basename(x);
                const tmp = acc.find(({dir}) => dir_ === dir);
                if(tmp){
                    const {files} = tmp;
                    files.push(file);
                }else{
                    acc.push({dir:dir_,files:[file]})
                }
                return acc;
            }, [] as Array<{dir:string,files:Array<string>}>
        );
    }
}
/**
 * 
 * @param srcs 
 * @param acc 
 * @returns 
 */
export function references(configs: Array<ts.ParsedCommandLine>, acc: Array<AbsolutePath> = []) {
    // read tsconfigs
    const projectReferences = configs.flatMap(config => utils.get(config, "projectReferences"))
        .filter(exists) as Array<{ path: string, originalPath: string }>;

    const projectRefPaths = projectReferences.map(x => path.dirname(x.path));

    if (projectRefPaths.length === 0)
        return acc;
    else {
        acc.push(...projectRefPaths);
        const new_configs = projectRefPaths.map(x => read_tsconfig(x))
            .filter(exists) as Array<ts.ParsedCommandLine>
        return references(new_configs, acc)
    }
}
