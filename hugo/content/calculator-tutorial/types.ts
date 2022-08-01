import {exec} from 'child_process'

import TerminalKit from 'terminal-kit';

export type Reporter = (level: 'warn'|'err', message: string) => void; 

export interface Stage {
    readonly id: string;
    before(report: Reporter): Promise<boolean>;
    initialize(): Promise<boolean>;
    after(report: Reporter): Promise<boolean>;
}

export const term = TerminalKit.terminal;

export async function runCommand(title: string, command: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        term.magenta(title+'...\n');
        exec(command, (error, stdout, stderr) => {
            if (error) {
                term.red('failed\n'+error.message+'\n');
                return reject(error);
            }
            if (stderr) {
                term.red('failed\n'+stderr+'\n');
                return reject(stderr);
            }
            term.green('done\n');
            resolve(stdout);
        });
    });
}

export function choose(items: string[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        term.singleColumnMenu( items , function( error , response ) {
            if(error) {
                return reject(error);
            }
            term('\n').eraseLineAfter.magenta("> selected: %s\n" , response.selectedText);
            resolve(response.selectedIndex);
        });
    });
}

