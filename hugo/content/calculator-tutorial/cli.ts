import Cmd from 'yargs';
import { term, choose, Reporter, removeFolder } from './types';
import { Stages } from './stages';
import { zip } from 'zip-a-folder';
import { resolve, relative } from 'path';

Cmd
  .scriptName("tutorial")
  .command('init [stage]', 'initializes the tutorial environment for a given stage', (yargs) => {
    yargs.positional('stage', {
      type: 'string',
      describe: 'name of the stage'
    });

    yargs.option('z', {
        alias: 'zip',
        demandOption: false,
        describe: 'Save a zip for each step',
        type: 'boolean'
    });

    yargs.option('o', {
        alias: 'out',
        demandOption: true,
        default: '.',
        describe: 'Output directory',
        type: 'string'
    });
  }, async function (argv) {
    const writeZip = argv.zip === true;

    process.chdir(argv.out as string);

    let maxStageIndex = Stages.findIndex(s=> s.id === argv.stage);
    if(maxStageIndex === -1) {
        term.magenta('< No stage selected. Please choose a stage.\n') ;
        const items = Stages.map((s, index) => `${index+1}. ${s.id}`);
        const chosen = await choose(items);
        maxStageIndex = chosen;
    }

    term.magenta('< Bootstraping tutorial environment\n\n')

    const report: Reporter = (level, message) => {
        term('    ');
        level === 'warn' ? term.yellow(message) : term.red(message);
        term('\n')
    };

    for (let stageIndex = 0; stageIndex < maxStageIndex+1; stageIndex++) {
        const stage = Stages[stageIndex];

        term.magenta(`< ${stageIndex+1}. stage: ${stage.id}\n`)
        term.blue(`! Checking preconditions... \n`)
        await stage.before(report);

        term.blue(`! Initializing stage... \n`)
        await stage.initialize();

        term.blue(`! Checking postconditions... \n`)
        await stage.after(report);

        if(writeZip) {
          term.blue(`! Zipping a starter... \n`);
          term.green(`> Removing node_modules, out, bin... \n`);
          await removeFolder('./node_modules');
          console.log(await removeFolder('./out'));
          console.log(await removeFolder('./bin'));

          term.green(`> Creating the archive... \n`)
          const from = resolve('.');
          const to = resolve('..', relative(__dirname, stage.dirname), 'start.zip');
          await zip(from, to)
        }
    }
    term.green();
    process.exit(0);
  }).help().argv


process.on('SIGINT', () => {process.exit()})
process.on('SIGQUIT', () => {process.exit()});
process.on('SIGTERM', () => {process.exit()}); 