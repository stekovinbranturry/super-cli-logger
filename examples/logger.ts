import logger, { chalk } from '../src';

function main() {
  console.clear();

  logger.intro('logger.intro: 任务开始');
  logger.message(
    'logger基于 @clack/prompts 封装，可以先去看 README (https://github.com/natemoo-re/clack/blob/main/packages/prompts/README.md)',
  );

  logger.title('logger.title: 预设样式');
  logger.message('只返回 string，需要搭配 log 使用');
  logger.message(`${logger.gradient('logger.Gradient')}
${logger.link('logger.link: https://example.com')}
${logger.item('logger.item')}
${logger.items([
  { title: 'logger.list, 第二参数为 false', items: ['item1', 'item2'] },
  { items: ['item1', 'item2'] },
])}`);

  logger.title('logger.title: 使用 chalk');
  logger.message(
    `${chalk.reset('reset')} ${chalk.bold('bold')} ${chalk.dim('dim')} ${chalk.italic('italic')} ${chalk.underline('underline')} ${chalk.overline('overline')} ${chalk.inverse('inverse')} ${chalk.hidden('hidden')} ${chalk.strikethrough('strikethrough')}`,
  );
  logger.message(
    `${chalk.black('black')} ${chalk.red('red')} ${chalk.green('green')} ${chalk.yellow('yellow')} ${chalk.blue('blue')} ${chalk.magenta('magenta')} ${chalk.cyan('cyan')} ${chalk.white('white')}`,
  );
  logger.message(
    `${chalk.redBright('redBright')} ${chalk.greenBright('greenBright')} ${chalk.yellowBright('yellowBright')} ${chalk.blueBright('blueBright')} ${chalk.magentaBright('magentaBright')} ${chalk.cyanBright('cyanBright')} ${chalk.whiteBright('whiteBright')}`,
  );
  logger.message(
    `${chalk.bgBlack('bgBlack')} ${chalk.bgRed('bgRed')} ${chalk.bgGreen('bgGreen')} ${chalk.bgYellow('bgYellow')} ${chalk.bgBlue('bgBlue')} ${chalk.bgMagenta('bgMagenta')} ${chalk.bgCyan('bgCyan')}`,
  );
  logger.message(
    `${chalk.bgWhite('bgWhite')} ${chalk.bgRedBright('bgRedBright')} ${chalk.bgGreenBright('bgGreenBright')} ${chalk.bgYellowBright('bgYellowBright')} ${chalk.bgBlueBright('bgBlueBright')} ${chalk.bgMagentaBright('bgMagentaBright')} ${chalk.bgCyanBright('bgCyanBright')} ${chalk.bgWhiteBright('bgWhiteBright')}`,
  );

  logger.title('logger.title: 各种 log');
  logger.message('logger.message');
  logger.step('logger.step');
  logger.info('logger.info');
  logger.warn('logger.warn');
  logger.error('logger.error');
  logger.note(
    '默认情况下 logger.error和 logger.fatal只会打印 log message，如果需要打印完整的错误，请传入第二个参数true',
    '错误处理说明',
  );
  logger.success('logger.success');
  logger.list([{ title: 'logger.list', items: ['item1', 'item2'] }, { items: ['item1', 'item2'] }]);
  logger.note(`cd project\npnpm install\npnpm dev`, '下一步');
  logger.outro('logger.outro: 任务结束');
  logger.fatal('logger.fatal: 阻塞性错误，直接退出进程');
}

main();
