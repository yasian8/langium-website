import { removeFolder, Reporter, runCommand, runScript, Stage, term } from "../../../types";
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
    dirname = __dirname
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
            await runScript('Installing Yeoman', "steps/00-install-yo.sh");
        }
        if(!('generator-langium' in list.dependencies)) {
            await runScript('Installing Langium', "steps/01-install-langium.sh");
        }
        await runScript('Run Yeoman with Langium generator', "steps/02-run-langium-cli.sh", {promptAnswers: [
            'ErrorMathTutorial',
            'Error Math',
            '.errmath'
        ], ignoreStdErr: true});
        await runCommand('Move files to <cwd>', 'steps/03-move-to-root-folder.sh');
        await removeFolder('./ErrorMathTutorial');
        await runCommand('Install node modules', 'npm install');
        return true;
    }
    async after(report: Reporter): Promise<boolean> {
        try {
            await runCommand('Generate files from Langium grammar', 'npm run langium:generate');
            await runCommand('Generate Javascript sources', 'npm run build');
        } catch(err: unknown) {
            if(err instanceof Error) {
                report('err', err.message);
            } else if(typeof err === 'string') {
                report('err', err);
            }
        }
        
        return Promise.resolve(true);
    }
}
