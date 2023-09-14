import * as fs from 'node:fs/promises'

import log from "./gast-log.js"

export function get(data:Obj_t|undefined,key:String,sep='.'):Value_t{
    const keys = key.split(sep);
    return keys.reduce((data, key) => (data? data[key]:undefined), data);
}

export const exists = (x:any):boolean => x

/**
 * Reads JSON data pointed by {@link p}
 * @param p 
 * @returns 
 */
export async function read_json(p:AbsolutePath){
  try{

    const json_str = await fs.readFile(p,{encoding:'utf8'})
    return JSON.parse(json_str)

  }catch(e:any){
    log.error(e.message)
  }
}
/**
 * Writes {@ jason_data} to file given by {@link p}
 * @param p 
 * @param json_data 
 */
export async function  write_json(p:AbsolutePath,json_data:Obj_t,indent:number=4){

  try{
    await fs.writeFile(p,JSON.stringify(json_data,null,indent));
  }catch(e:any){
    log.error(e.message)
  }

}
//add methods to Array prototype
declare global {
  interface Array<T> {
    unique(): Array<T>;
    unique_wkey<T extends Obj_t>():Array<T>;
    zip(y:Array<T>):Array<T>;
  }
}
// add unique to Array.prototype
if (Object.entries(Array.prototype).findIndex(([k,_]) => k === 'unique') === -1)
{
    Object.defineProperty(Array.prototype,'unique',{
      value: function<T>() {
        return this.reduce(
          (acc:Array<T>,x:T) => {
            if(acc.findIndex(y => y === x ) === -1)
                acc.push(x)
                return acc;
          },[]
        );
      }
    });
}
// add unique_wkey to Array.prototype
if (Object.entries(Array.prototype).findIndex(([k,_]) => k === 'unique_wkey') === -1)
{
    Object.defineProperty(Array.prototype,'unique_wkey',{
      value:function<T extends Obj_t>(k:Key_t){
        return this.reduce( 
          (acc:Array<T>,x:T) => {
            if(acc.findIndex((y:T) => y[k] === x[k]) === -1)
              acc.push(x)
            return acc;
          },[]
        );
      }
    });
}

// add zip to Array.prototype
if (Object.entries(Array.prototype).findIndex(([k,_]) => k === 'zip') === -1)
{
  Object.defineProperty(Array.prototype,'zip',{
    value:function<T>(ys:Array<T>){
      if(this.length <= ys.length )
        return this.map((x:T,i:number) => [x,ys[i]]);
      else
        return ys.map((y,i) => [this[i],y]);
    }
  });
}
