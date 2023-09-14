// import { configDefaults, defineConfig } from 'vitest/config'
import { UserConfigExport, defineConfig, mergeConfig } from 'vitest/config'
// import viteConfig from './vite.config'
import { defineConfig  as vite_defineConfig} from 'vite'

// export default defineConfig({
//   test: {
//     include: ['**/*.{vitest,spec}.?(c|m)[jt]s?(x)'],
//   }
// })

// define 
function capitalizeFirstLetter(str:string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * 
 */
interface RefPath {
  match:string,
  namespace:string,
  module:string
}
const ref_regexp = /^\s*\/\/\/\s+<reference\s+path=['|"](.*)(\.ts){1}['|"]\s*\/>\s*$/gm
/***
 * 
 */
const namespaces = (code:string) => {
  let ret:Array<RefPath> = [];
  let res = ref_regexp.exec(code);
  while(res){
      let tmp = res[1].split('/');
      ret.push({match:res[0],namespace:capitalizeFirstLetter(tmp[tmp.length-1]),module:res[1]})
      res = ref_regexp.exec(code);
  }//while
  return ret;
}

const viteConfig = vite_defineConfig({
  plugins:[
    {
        name:"Transform ts namespaces into module import to enable vitest usage",
        enforce: 'pre',
        // see: https://rollupjs.org/plugin-development/#resolveid
        // resolveId(source, importer, options){
        //     console.log(`source: ${source} - importer: ${importer} - options: ${JSON.stringify(options)}`)
        //     //Local import ?
        //     // if(source.startsWith('./') || source.startsWith('../')){
        //     // if( !path.isAbsolute(source))
        //     // {
        //     //     const {base} = path.parse(source);
        //     //     return `${LOCAL_MODULE_PREFIX}_${base}`;
        //     // }
        //     //back to default behaviour
        //     return null;
        // },
        // load(id: string){
        //   console.log(`id: ${id}`);
        //   return null;
        // },
        //
        transform(code) {
          // export namespace
          let transformedCode = code.replace(/namespace/g,"export namespace");
          //find all reference tags to local namespace definitions (i.e /// <reference path="./foo.bar.ts"/>)
          // and turn them into module import (i.e import {Bar} from './foo.bar')
          return namespaces(transformedCode).reduce(
            (acc:string,{match,namespace,module}) => acc.replace(match,`import {${namespace}} from './${module}'`),
            transformedCode
          );
        }
    }
  ]
})

//
export default mergeConfig(viteConfig, defineConfig(
  {
    test: {
      include: ['./vitests/*.{test,spec}.?(c|m)[jt]s?(x)'],
      cache :{dir:"./vitests/"}
    },
  }
))