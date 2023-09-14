import npmlog from "npmlog"
import * as fs from 'node:fs/promises';
import path from 'node:path';

import {GAST_ROOT} from "./gast-globals.js"

//helping functions
function getFuncName() {
    const stack = (new Error()).stack;
    if(stack)
        return stack.split('\n')[3].replace(/^\s+at\s+(.+?)\s.+/g, '$1' );
}
const two_digits = (s:number) => (s > 9)? `${s}` : `0${s}`
const fmt_date = (d:Date) => `${two_digits(d.getDate())}/${two_digits(d.getMonth()+1)}/${d.getFullYear()}@${two_digits(d.getHours())}h${two_digits(d.getMinutes())}m${two_digits(d.getSeconds())}s`

//logging functions with prefix set by default to the name of the caller
const logFuncNames = ["verbose","info","notice","warn","error"];
const exportedSymbols:Obj_t = logFuncNames.reduce( (acc,logFuncName) =>{
    acc[logFuncName] = (msg:string,prefix=getFuncName()) => npmlog[logFuncName](prefix,`[${fmt_date(new Date())}] ${msg}`)
    return acc;
    },
    {} as Obj_t
);

//set_level
exportedSymbols['set_level'] = (level:string) => npmlog.level = level;
// on 
exportedSymbols['on'] = (event:string,cbk:(message:string) => void ) => npmlog.on(event,cbk);
// on_file
exportedSymbols["log_dir"] = "./logs"

interface LogMessage{
    id: Number,
    level: string,
    prefix: string,
    message: string, 
    messageRaw: Array<any> 
}

const mk_append_file = (log_file:string) => async ({level,prefix,message}:LogMessage) => { 
    try{
        const p = path.resolve(GAST_ROOT,exportedSymbols["log_dir"],log_file);
        await fs.appendFile(p,`${level} ${prefix} ${message}\n`)
    }catch(e:any){console.error(`Cannot log to file: ${log_file} (in dir: ${exportedSymbols["log_dir"]}) (Error:${e.message})`)}
}

exportedSymbols['on_wfile'] = (event:string,log_file:string) => { 
    npmlog.on(event,mk_append_file(log_file));
}

exportedSymbols['all_wfile'] = (log_file:string) => { 
    logFuncNames.forEach( level => npmlog.on(`log.${level}`,mk_append_file(log_file)))   
}

export default exportedSymbols
