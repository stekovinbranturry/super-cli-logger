# super-cli-logger

[@clack/prompts](https://github.com/bombshell-dev/clack/tree/main/packages/prompts) 的个人优化版本：
- 整合了 `@clack/core` 和 `chalk`
- 解决了中文的显示问题
- 优化了一些用法
- 类型更友好

## Installation

```bash
pnpm add super-cli-logger
```

## Logger

Logger 提供了丰富的控制台输出功能，支持预设样式、颜色和格式化

### 日志类型

会在任务上创建一个节点

```ts
import logger from 'super-cli-logger';

// 日志节点类型
logger.message('普通消息');
logger.step('步骤信息');
logger.info('信息提示');
logger.warn('警告信息');
logger.error('错误信息');
logger.success('成功信息');
logger.note('注意事项', '标题'); // 第二个参数为可选的标题
```

### 标题类

用于任务开始、结束、分类

```typescript
import logger from 'super-cli-logger';

// 任务开始和结束
logger.intro('任务开始');
logger.outro('任务结束');

// 标题
logger.title('这是一个标题');
```

### 错误处理

```typescript
// 默认只打印 error.message
logger.error('发生错误');

// 传入第二个参数 true 可打印完整错误信息
logger.error('发生错误', true);

// 会阻塞进程并退出
logger.fatal('致命错误', true); 
```

### 预设样式

这些方法返回格式化的字符串，不会直接打印，需要配合 `logger.message()`等方法使用：

```typescript
import logger from 'super-cli-logger';

logger.message(`
  ${logger.gradient('渐变文字')}
  ${logger.link('https://example.com')}
  ${logger.item('列表项')}
`);
```

### Chalk 颜色支持

Logger 还导出了 `chalk` 实例，支持丰富的颜色和样式：

```typescript
import { chalk } from 'super-cli-logger';

// 文字样式
chalk.bold('粗体') + chalk.italic('斜体') + chalk.underline('下划线');

// 文字颜色
chalk.red('红色') + chalk.green('绿色') + chalk.blue('蓝色');

// 背景颜色
chalk.bgRed('红色背景') + chalk.bgGreen('绿色背景');

// 组合使用
chalk.bold.red.bgWhite('粗体红色文字白色背景');
```

## Prompts 组件

```ts
import {
  spinner,
  tasks,
  confirm,
  group,
  multiselect,
  password,
  select,
  spinner,
  text,
} from 'super-cli-logger';
```

### Spinner

单个任务

```ts
import { spinner } from 'super-cli-logger';

const s1 = spinner();
s1.start('Task 1');
await setTimeout(1000);
s1.stop('Task 1 Completed');
```

### Tasks

多个任务

```ts
import { tasks } from 'super-cli-logger';

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
    // 可以根据条件调过任务
    enabled: false,
  },
  {
    title: '复制配置文件',
    task: async () => {
      await setTimeout(1000);
      // 任务完成后的文案，不 return 则使用 title
      return '配置文件已复制';
    },
  },
]);
```

### Text

单行文本

```js
import { text } from 'super-cli-logger;

const meaning = await text({
  message: 'What is the meaning of life?',
  placeholder: 'Not sure',
  initialValue: '42',
  validate(value) {
    if (value.length === 0) return `Value is required!`;
  },
});
```

### Confirm

确认，返回 boolean

```js
import { confirm } from 'super-cli-logger;

const shouldContinue = await confirm({
  message: 'Do you want to continue?',
});
```

### Select

单项选择

```js
import { select } from 'super-cli-logger;

const projectType = await select({
  message: 'Pick a project type.',
  options: [
    { value: 'ts', label: 'TypeScript' },
    { value: 'js', label: 'JavaScript' },
    { value: 'coffee', label: 'CoffeeScript', hint: 'oh no' },
  ],
});
```

### Multi-Select

多项选择

```js
import { multiselect } from 'super-cli-logger;

const additionalTools = await multiselect({
  message: 'Select additional tools.',
  options: [
    { value: 'eslint', label: 'ESLint', hint: 'recommended' },
    { value: 'prettier', label: 'Prettier' },
    { value: 'gh-action', label: 'GitHub Action' },
  ],
  required: false,
});
```

```js
import { groupMultiselect } from 'super-cli-logger;

const basket = await groupMultiselect({
  message: 'Select your favorite fruits and vegetables:',
  options: {
    fruits: [
      { value: 'apple', label: 'apple' },
      { value: 'banana', label: 'banana' },
      { value: 'cherry', label: 'cherry' },
    ],
    vegetables: [
      { value: 'carrot', label: 'carrot' },
      { value: 'spinach', label: 'spinach' },
      { value: 'potato', label: 'potato' },
    ]
  }
});
```

## Examples

运行examples命令查看详细用法

```bash
pnpm examples:logger
pnpm examples:prompts
pnpm examples:spinner
```

![logger](http://github.com/stekovinbranturry/super-cli-logger/blob/main/images/logger.png)
![spinner](http://github.com/stekovinbranturry/super-cli-logger/blob/main/images/spinner.png)
![prompts](http://github.com/stekovinbranturry/super-cli-logger/blob/main/images/prompts.png)
