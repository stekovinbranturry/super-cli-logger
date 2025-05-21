import { setTimeout } from 'node:timers/promises';

import logger, { confirm, group, multiselect, password, select, spinner, text } from '../src';

async function main() {
  console.clear();

  logger.intro('问答开始');

  const project = await group(
    {
      path: async () =>
        text({
          message: 'Where should we create your project?',
          placeholder: './sparkling-solid',
          validate: (value) => {
            if (!value) return 'Please enter a path.';
            if (!value.startsWith('.')) return 'Please enter a relative path.';
            return undefined;
          },
        }),
      password: async () =>
        password({
          message: 'Provide a password',
          validate: (value) => {
            if (!value) return 'Please enter a password.';
            if (value.length < 5) return 'Password should have at least 5 characters.';
            return undefined;
          },
        }),
      type: async ({ results }) =>
        select({
          message: `Pick a project type within "${results.path}"`,
          initialValue: 'ts',
          maxItems: 5,
          options: [
            { value: 'ts', label: 'TypeScript' },
            { value: 'js', label: 'JavaScript' },
            { value: 'rust', label: 'Rust' },
            { value: 'go', label: 'Go' },
            { value: 'python', label: 'Python' },
            { value: 'coffee', label: 'CoffeeScript', hint: 'oh no' },
          ],
        }),
      tools: async () =>
        multiselect({
          message: 'Select additional tools.',
          initialValues: ['prettier', 'eslint'],
          options: [
            { value: 'prettier', label: 'Prettier', hint: 'recommended' },
            { value: 'eslint', label: 'ESLint', hint: 'recommended' },
            { value: 'stylelint', label: 'Stylelint' },
            { value: 'gh-action', label: 'GitHub Action' },
          ],
        }),
      install: async () =>
        confirm({
          message: 'Install dependencies?',
          initialValue: false,
        }),
    },
    {
      onCancel: () => {
        logger.cancel('Operation cancelled.');
        process.exit(0);
      },
    },
  );

  if (project.install) {
    const s = spinner();
    s.start('Installing via pnpm');
    await setTimeout(2500);
    s.stop('Installed via pnpm');
  }

  const nextSteps = `cd ${project.path}\n${project.install ? '' : 'pnpm install\n'}pnpm dev`;

  logger.note(nextSteps, 'Next steps.');

  logger.outro(`Problems? (https://example.com/issues)`);
}

main().catch(console.error);
