import ts from 'typescript';
import { readFileSync } from "fs";

interface ParamDesc{
    name:string,
    type: string
}

interface FuncDesc{
    name:string,
    type: "Function" | "ArrowFunction"
    parameters?:Array<ParamDesc>,
    retType?:string,
}

type NodeConditionCbk = (n:ts.Node)=>Boolean;

export function api(path:string) {

   // read input file and create ast
    const ast = ts.createSourceFile(path,readFileSync(path).toString(),ts.ScriptTarget.Latest,true);
    // extract all that is exported
    const exported = extract_child(ast,n => ts.SyntaxKind[n.kind] === 'ExportKeyword',1);
    // among exported extract functions
    const functions = exported.flatMap(node => extract(node,n => ts.isFunctionDeclaration(n)));
    // among exported extract variables
    const variables = exported.flatMap(node => extract(node,n => ts.isVariableStatement(n),0));
    // extract arrow functions from variables
    const arrow_functions_declarations = variables.filter(variable => check_rec(variable,n => ts.isArrowFunction(n)));
    const arrow_functions = arrow_functions_declarations.flatMap(node => extract(node,n => ts.isVariableDeclaration(n),3));
    return functions.map(f => function_infos(f)).concat(arrow_functions.map(f => arrow_function_infos(f)) );
}

function extract_child(root:ts.Node,condition:NodeConditionCbk,level=-1){
    const ret:Array<ts.Node> = [];
    root.forEachChild(child => {if(check_rec(child,condition,level)) ret.push(child)})
    return ret;
}

function extract(node:ts.Node,condition:NodeConditionCbk,level=-1,depth=0){
    const ret:Array<ts.Node> = [];
    depth++
    if(condition(node))
        ret.push(node)
    else if(level < 0 || depth <= level){
        node.forEachChild(n => {
            extract(n,condition,level)
            .forEach(x => ret.push(x));
            }
        );
    }
    return ret;
}

function check_rec(node:ts.Node, condition:NodeConditionCbk, level = -1, depth = 0) {

    if (condition(node))
        return true;
    else {
        let res = false;
        depth++;
        if (level < 0 || depth <= level)
        {
            node.forEachChild(child => {
                if (!res)
                {
                    res = check_rec(child, condition, level, depth);
                }
            });
        }
        return res;
    }
}

function parameter_infos(node:ts.Node){
    const [name] = get_name(node);
    const [type] = extract_child(node,n => !ts.isIdentifier(n),0).map(n=> n.getFullText());
    return {name:name,type:type};
}
const get_name = (node:ts.Node) => extract_child(node,n => ts.isIdentifier(n),0).map(n=> n.getFullText().trim())

const parameters = (node:ts.Node) => extract_child(node,n => ts.isParameter(n),0).map(n=> parameter_infos((n)))

const rettype  = (node:ts.Node) => extract_child(node,n => ts.isTypeReferenceNode(n),0).map(n=> n.getFullText())

function function_infos(node:ts.Node):FuncDesc
{
    const [name]     = get_name(node);
    const params     = parameters(node);
    const [retType]  = rettype(node);
    if(retType)
        return {type: "Function",name:name,parameters:params,retType:retType};
    else 
        return {type: "Function",name:name,parameters:params};
}

function arrow_function_infos(node:ts.Node):FuncDesc
{
    const [name]     = get_name(node);
    const arrowNode  = extract_child(node,n => ts.isArrowFunction(n),1)[0];
    const params     = parameters(arrowNode);
    const [retType]  = rettype(arrowNode);
    if(retType)
        return {type: "ArrowFunction",name:name,parameters:params,retType:retType};
    else 
        return {type: "ArrowFunction",name:name,parameters:params}; 
}

// console.log(apis.length);
// const apis = api('/home/benj/Documents/code/javascript/bb-immo/gas-tools/code/gas-tools.ts');
// console.log(
//     JSON.stringify(apis,null,4)
// );
