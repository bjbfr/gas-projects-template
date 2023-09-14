import path from 'node:path'

import log from "./gast-log.js"
import {api} from "./gast-tsc-parser.js"
import { REP_ROOT } from "./gast-globals.js"

const MODULE_PATH = './gas-tools.js';
type Module = typeof import ('./gas-tools.js');
const MODULE = await import(MODULE_PATH);

/**
 * 
 * @param module 
 * @param end_point_name 
 * @returns 
 */
function get_end_point(module:Module,end_point_name:string){
    const tmp = Object.entries(module).find(([k,_]) => k === end_point_name);
    if(tmp)
      return tmp[1];
}
/**
 * 
 * @param module 
 * @param end_point_name 
 * @param args 
 * @returns 
 */
async function apply(module:Module,end_point_name:string,args:Array<string>):Promise<string|undefined>{
    const end_point = get_end_point(module,end_point_name) as any;
    if(!end_point)
        throw new Error(`No end point named: ${end_point_name} found in ${MODULE_PATH}`);
    else{
        return end_point(...args);
    }
}
/**
 * 
 * @param argv 
 * @returns 
 */
function parse(argv:Array<string>){
    const [end_point_name, ...args] = argv.slice(2);
    return {end_point_name:end_point_name,args:args};
}
/**
 * 
 * @param module 
 * @param argv 
 */
async function run(module:Module,argv:Array<string>){
    try{
        const {end_point_name,args} = parse(argv);
        const ret = await apply(module,end_point_name,args);
        if(ret)
            console.log(ret);
    }catch(e:any){
        log.error(`${e.name}: ${e.message}`)
    }
}

// execute here:
//log files
log.all_wfile('gas-tools.log');
// log all action independently.
api(path.resolve(REP_ROOT,'gas-tools','code','gas-tools.ts')).forEach(
    ({name}) => log.on_wfile(name,`${name}.log`)
)
// run command
await run(MODULE,process.argv);

// fake export
export {}
