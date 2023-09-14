import { exec_command } from './gast-childprocess.js'
import log from "./gast-log.js"
import prompts from 'prompts'
import path from 'node:path'

import { read_json,get } from "./gast-utils.js"
import { REP_ROOT } from "./gast-globals.js"
/**
 * 
 */
const regexp_clasp_list = /^\s*(\w*)\s*-\s*https:\/\/script.google.com\/d\/(.*)\/edit$/gm
function parse_clasp_list(out: string) {
  const ret = [] as Array<prompts.Choice>;
  let res = regexp_clasp_list.exec(out);
  while (res) {
    const name = res[1].trim();
    const scriptId = res[2].trim();
    ret.push({ title: name, value: scriptId });
    res = regexp_clasp_list.exec(out);
  }
  return ret;
}
/**
 * 
 * @returns 
 */
async function clasp_list() {
  try {
    const { stdout } = await exec_command("clasp list");
    return parse_clasp_list(stdout);
  } catch (e: any) {
    log.error(e.message)
  }
}
/**
 * 
 */
const create_clone_or_no: Array<prompts.PromptObject> = [
  {
    type: 'toggle',
    name: 'bindAppScript',
    message: 'Do you want to bind an AppScript project?',
    initial: true,
    active: 'yes',
    inactive: 'no'
  },
  {
    type: (prev: boolean) => prev === true ? 'select' : null,
    name: 'clasp_cmd',
    message: 'Create or Clone?',
    initial: 0,
    choices: [
      { title: "create a new AppScript Project.", value: "create" },
      { title: "clone an existing AppScript Project.", value: "clone" }
    ]
  }
];
/**
 * 
 * @param scriptIds 
 * @returns 
 */
const clasp_clone_options_prompt = (scriptIds: Array<prompts.Choice> | undefined) => {

  const base = {
    name: 'scriptId',
    message: 'Choose a scriptId:'
  };
  if (scriptIds && scriptIds.length > 0)
    return Object.assign(base, { type: 'select', choices: scriptIds }) as prompts.PromptObject
  else
    return Object.assign(base, { type: 'text' }) as prompts.PromptObject
}
/**
 * 
 * @param artefactType 
 * @returns 
 */
const script_type = (artefactType: ArtefactType) => {

  if(artefactType === "lib")
    return [{title:"Script",value:"standalone"}];
  else
  return [
    {title:"Spreadsheet",value:"sheets"},
    {title:"Document",value:"docs"},
    {title:"Presentation",value:"slides"},
    {title:"Form",value:"forms"},
  ];
}
/**
 * 
 */
const default_parentId = async () => {
  const cloud = await read_json(path.relative(REP_ROOT, "./cloud.json"));
  const folder = get(cloud,"drive.libFolder");
  return folder ? folder :'';
}
/**
 * 
 * @param name 
 * @param artefactType 
 * @returns 
 */
const clasp_create_options_prompt = async (name: string, artefactType: ArtefactType) => [
  {
    type: 'text',
    name: 'title',
    initial: name,
    message: 'Choose a name:'
  },
  {
    type: (prev:string) => (prev)?null:'select',
    name: 'type',
    initial: 0,
    message: 'Choose a type:',
    choices:script_type(artefactType)
  },
  {
    type: artefactType === 'lib'?'text':null,
    name: 'parentId',
    message: 'Select the Google Drive folder:',
    initial: await default_parentId(),
  }
] as Array<prompts.PromptObject>

const bottom_left = '└─';
/**
 * 
 * @param out 
 * @returns 
 */
function parse_clasp_init(out:string){
  return out.split('\n').reduce(({acc,match},x:string) => {
    if(match && x.startsWith(bottom_left)){
      acc.push(x.replace(bottom_left,'').trim())

    }else if (match){
      match = false;
    }else{
      if(x.startsWith('Cloned'))
        match = true;
    }
    return {acc,match};
  },{acc:[],match:false} as {acc:Array<string>,match:boolean}).acc;
}
/**
 * 
 * @param root 
 * @param artefactType 
 * @param name 
 * @returns 
 */
export async function clasp_init(root: string, artefactType: ArtefactType, name: string) {
  try {
    //ask whether or not to bind an AppScript Project 
    // if yes, whether to create a new one or to bind 
    const { bindAppScript, clasp_cmd } = await prompts(create_clone_or_no);

    if (bindAppScript) {
      let options: prompts.Answers<string>;
      let cmd: string | undefined = undefined;
      if (clasp_cmd === 'create') { // create command
        options = await prompts(await clasp_create_options_prompt(name, artefactType));
        const args = Object.entries(options)
          .filter(([_, v]) => v)
          .map(([k, v]) => `--${k} ${v}`).join(' ');
        cmd = `clasp ${clasp_cmd} ${args}`;
      }
      else if (clasp_cmd === 'clone') { // clone command
        const scriptIds = await clasp_list();
        options = await prompts(clasp_clone_options_prompt(scriptIds));
        cmd = `clasp ${clasp_cmd} ${options.scriptId}`;
      }
      //run command
      if (cmd) {
        const { stdout } = await exec_command(cmd, root, true);
        return parse_clasp_init(stdout);
      }
    }
  } catch (e: any) {
    log.error(e.message);
  }
}
