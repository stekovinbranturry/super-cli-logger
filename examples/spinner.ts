import { setTimeout } from 'node:timers/promises';

import logger, { spinner, tasks } from '../src';

async function main() {
  logger.intro('Start');
  logger.title('单个任务');

  const s1 = spinner();
  s1.start('Task 1');
  await setTimeout(1000);
  s1.stop('Task 1 Completed');

  const s2 = spinner();
  s2.start('Task 2');
  await setTimeout(1000);
  s2.stop('Task 2 Completed');

  logger.title('多个任务');
  await tasks([
    {
      title: '配置 .npmrc',
      task: async () => {
        await setTimeout(1000);
      },
    },
    {
      title: '添加 devDependencies',
      task: async () => {
        await setTimeout(1000);
      },
      enabled: false,
    },
    {
      title: '复制配置文件',
      task: async () => {
        await setTimeout(1000);
        return '配置文件已复制';
      },
    },
  ]);
  logger.outro();
}

main().catch(console.error);
