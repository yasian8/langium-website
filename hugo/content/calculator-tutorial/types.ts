import {exec} from 'child_process'
import fs from 'fs/promises';
import TerminalKit from 'terminal-kit';
import rimraf from 'rimraf';

export type Reporter = (level: 'warn'|'err', message: string) => void; 

export interface Stage {
    readonly id: string;
    readonly dirname: string;
    before(report: Reporter): Promise<boolean>;
    initialize(): Promise<boolean>;
    after(report: Reporter): Promise<boolean>;
}

export const term = TerminalKit.terminal;

export async function write(stream: any, input: string): Promise<void> {
    await stream.write(input+'\n');
}

export interface RunCommandOptions {
    promptAnswers?: string[];
    ignoreStdErr?: boolean;
}

export async function runScript(title: string, commandPath: string, options?: RunCommandOptions): Promise<string> {
    const command = await fs.readFile(commandPath, 'utf-8');
    return runCommand(title, command, options);
}

export async function runCommand(title: string, command: string, options?: RunCommandOptions): Promise<string> {
    options = Object.assign({
        ignoreStdErr: false,
        promptAnswers: []
    }as RunCommandOptions, options);
    return new Promise<string>(async (resolve, reject) => {
        term.green('> '+title+'...\n');
        const childProcess = exec(command, (error, stdout, stderr) => {
            if (error) {
                term.red('failed error\n'+error.message+'\n');
                return reject(error);
            }
            if (!options!.ignoreStdErr && stderr) {
                term.red('failed stderr\n'+stderr+'\n');
                return reject(stderr);
            }
            resolve(stdout);
        });
        let lastOutput: Date|null = new Date();
        let inputIndex = 0;
        childProcess.stdout?.on('data', (d) => {lastOutput = new Date(); /** DEBUG console.log(d) */});
        childProcess.stdout?.on('close', () => lastOutput = null);
        let interval: NodeJS.Timer;
        interval = setInterval(() => {
            if(lastOutput == null || inputIndex >= options!.promptAnswers!.length) {
                childProcess.stdin?.end();
                return clearInterval(interval);
            }
            if(Date.now() - lastOutput.getTime() > 1000) {
                write(childProcess.stdin!, options!.promptAnswers![inputIndex]);
                inputIndex++;
            }
        }, 100);
        
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

export function removeFolder(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        rimraf(path, (err) => {
            if(err) return reject(err);
            resolve();
        });
    });
}