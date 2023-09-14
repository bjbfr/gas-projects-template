import child_process from 'node:child_process'
import util from 'node:util'

const SHELL = "/bin/bash";
/**
 * Enables Raw mode on process.stdin
 */
function enable_raw_mode() {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function (key: string) {  // handle ctrl-c keystroke
        if (key === '\u0003') { process.exit(); }
    });
}
/**
 * Disables Raw mode.
 */
function disable_raw_mode() {
    const stdin = process.stdin;
    stdin.setRawMode(false);
    stdin.resume();
}
/**
 * Bind io streams (stdin,stdout and stderr) of current node process with the given child {@link child}
 * @param child 
 */
function bind_io(child: child_process.ChildProcess) {

    enable_raw_mode();
    if (child && child.stdin && child.stdout && child.stderr) {
        child.stdout.pipe(process.stdout, { end: false });
        child.stderr.pipe(process.stderr, { end: false });
        process.stdin.pipe(child.stdin);
        child.stdout.on('end', disable_raw_mode);
    }

}

const exec_c = util.promisify(child_process.exec);
/**
 * Execute {@link cmd} in directory {@link cwd} using a different process binding ios if {@link redirect_io}
 * @param cmd 
 * @param cwd 
 * @param redirect_io 
 * @returns 
 */
export function exec_command(
    cmd: string,
    cwd: string | undefined = undefined,
    redirect_io: boolean = false
) {
    return exec_(
        cmd,
        cwd,
        redirect_io,
        (file:string,options:child_process.ExecOptions) => exec_c(file,options)
    );
}

const exec_f = util.promisify(child_process.execFile);
/**
 * Executes {@link file} in directory {@link cwd} using a different process binding ios if {@link redirect_io}
 * @param file 
 * @param cwd 
 * @param redirect_io 
 * @returns 
 */
export function exec_file(
    file: AbsolutePath,
    args:Array<string>,
    cwd: string | undefined = undefined,
    redirect_io: boolean = false
) {
    return exec_(
        file,
        cwd,
        redirect_io,
        (file:string,options:child_process.ExecOptions) =>  exec_f(file,args,options)
    );
}
/**
 * Executes {@link cmd_file}  (a file or a command) in directory {@link cwd} using a different process binding ios if {@link redirect_io}
 * @param cmd_file 
 * @param cwd 
 * @param redirect_io 
 * @param fexec 
 * @returns 
 */
function exec_(
    cmd_file: string,
    cwd: string | undefined = undefined,
    redirect_io: boolean = false,
    fexec:(cmd_file:string,options:child_process.ExecOptions) => child_process.PromiseWithChild<{stdout:string,stderr:string}>
    ) {

    const options = cwd ? { shell: SHELL, cwd: cwd } : { shell: SHELL };
    const ret = fexec(cmd_file, options);
    if (ret && redirect_io)
        bind_io(ret.child)

    return ret;
}