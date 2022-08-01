import { Reporter, runCommand, Stage, term } from "../../types";
import { readdir } from 'fs/promises'

export interface PackageVersion {
    version: string;
    resolved?: string;
}

export interface PackageList {
    name: string;
    dependencies: Record<string, PackageVersion>;
}

export class SetupStage implements Stage {
    id = 'setup Langium'
    async before(report: Reporter): Promise<boolean> {
        let result = true;
        const list = await readdir('.');
        if(list.length > 0) {
            report('err', 'Working directory needs to be empty!');
            result = false;
        }
        return result;
    }
    async initialize(): Promise<boolean> {
        const list = JSON.parse(await runCommand('Checking if Yeoman and Langium are installed', 'npm list -g --json')) as PackageList; 
        if(!('yo' in list.dependencies)) {
            await runCommand('Installing Yeoman and Langium', "npm i -g yo");
        }
        if(!('generator-langium' in list.dependencies)) {
            await runCommand('Installing Yeoman and Langium', "npm i -g generator-langium");
        }
        await runCommand('Run Yeoman with Langium generator', "yo langium");
        return true;
    }
    async after(report: Reporter): Promise<boolean> {
        return Promise.resolve(true);
    }
}
