import Cmd from 'yargs';
import { term, choose, Reporter } from './types';
import { Stages } from './stages';

Cmd
  .scriptName("tutorial")
  .command('init [stage]', 'initializes the tutorial environment for a given stage', (yargs) => {
    yargs.positional('stage', {
      type: 'string',
      describe: 'name of the stage'
    });
    yargs.option('o', {
        alias: 'out',
        demandOption: true,
        default: '.',
        describe: 'Output directory',
        type: 'string'
    });

    yargs.option('o', {
        alias: 'out',
        demandOption: true,
        default: '.',
        describe: 'Output directory',
        type: 'string'
    });
  }, async function (argv) {
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
        term.magenta(`  - checking preconditions... \n`)
        await stage.before(report);

        term.magenta(`  - initializing stage... \n`)
        await stage.initialize();
        term.magenta('\n')

        term.magenta(`  - checking postconditions... \n`)
        await stage.after(report);
        term.magenta('\n')

        term.magenta('\n')
    }
    term.green();
    process.exit(0);
  }).help().argv