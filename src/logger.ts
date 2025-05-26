// 复制改造自：https://github.com/natemoo-re/clack/blob/main/packages/prompts/src/index.ts
import { isCancel } from '@clack/core';
import chalk from 'chalk';
import gradientString from 'gradient-string';

import {
  S_BAR,
  S_BAR_END,
  S_BAR_H,
  S_BAR_START,
  S_CONNECT_LEFT,
  S_CORNER_BOTTOM_RIGHT,
  S_CORNER_TOP_RIGHT,
  S_ERROR,
  S_INFO,
  S_STEP_SUBMIT,
  S_SUCCESS,
  S_WARN,
} from './shared';

const note = (message = '', title = '') => {
  function ansiRegex() {
    const pattern = [
      '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
      '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
    ].join('|');

    return new RegExp(pattern, 'gu');
  }
  const strip = (str: string) =>
    str
      .replace(ansiRegex(), '')
      .replace(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/gu, 'aa');
  const lines = `\n${message}\n`.split('\n');
  const titleLen = strip(title).length;
  const len =
    Math.max(
      lines.reduce((sum, ln) => {
        const lnStrip = strip(ln);
        return lnStrip.length > sum ? lnStrip.length : sum;
      }, 0),
      titleLen,
    ) + 2;
  const msg = lines
    .map(
      (ln) =>
        `${chalk.gray(S_BAR)}  ${chalk.dim(ln)}${' '.repeat(len - strip(ln).length)}${chalk.gray(
          S_BAR,
        )}`,
    )
    .join('\n');
  process.stdout.write(
    `${chalk.gray(S_BAR)}\n${chalk.green(S_STEP_SUBMIT)}  ${chalk.reset(title)} ${chalk.gray(
      S_BAR_H.repeat(Math.max(len - titleLen - 1, 1)) + S_CORNER_TOP_RIGHT,
    )}\n${msg}\n${chalk.gray(S_CONNECT_LEFT + S_BAR_H.repeat(len + 2) + S_CORNER_BOTTOM_RIGHT)}\n`,
  );
};

export interface LogMessageOptions {
  symbol?: string;
}

const logger = {
  gradient: gradientString('#0099F7', '#F11712'),

  link(url: string, text?: string) {
    const styledUrl = chalk.underline.blue(url);
    if (text) {
      return `${text} (${styledUrl})`;
    }
    return styledUrl;
  },

  item(message: string) {
    return `${chalk.blue.bold('•')} ${message}`;
  },

  items(list: { title?: string; items: string[] }[]) {
    return list
      .map(({ title, items }) => {
        return `${title ? `${chalk.blue(title)}\n` : ''}${items.map(this.item).join('\n')}`;
      })
      .join('\n\n')
      .trim();
  },

  list(list: { title?: string; items: string[] }[]) {
    for (const { title, items } of list) {
      logger.info(
        `${title ? `${title}\n` : ''}${items.map(this.item).join('\n')}`,
      );
    }
  },

  message(
    message = '',
    { symbol = chalk.gray(S_BAR) }: LogMessageOptions = {},
  ) {
    const parts = [`${chalk.gray(S_BAR)}`];
    if (message) {
      const [firstLine, ...lines] = message.split('\n');
      parts.push(
        `${symbol}  ${firstLine}`,
        ...lines.map((ln) => `${chalk.gray(S_BAR)}  ${ln}`),
      );
    }
    process.stdout.write(`${parts.join('\n')}\n`);
  },
  info(message: string) {
    this.message(message, { symbol: chalk.blue(S_INFO) });
  },
  success(message: string) {
    this.message(message, { symbol: chalk.green(S_SUCCESS) });
  },
  step(message: string) {
    this.message(message, { symbol: chalk.green(S_STEP_SUBMIT) });
  },
  warn(message: string) {
    this.message(message, { symbol: chalk.yellow(S_WARN) });
  },
  /** Alias for `this.warn()`. */
  warning(message: string) {
    this.warn(message);
  },
  /**
   * @param error 错误
   * @param fullLog 是否打印完整的错误，默认只打印 message
   */
  error(error: unknown, fullLog?: boolean) {
    let message = '';
    if (error instanceof Error) {
      ({ message } = error);
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      ({ message } = error as { message: string });
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error
    ) {
      ({ error: message } = error as { error: string });
    } else {
      message = String(error);
    }
    if (fullLog && typeof error !== 'string') {
      console.error(error);
    } else {
      this.message(message, { symbol: chalk.red(S_ERROR) });
    }
  },
  fatal(error: unknown) {
    this.error(error);
    process.exit(1);
  },
  intro(title = '') {
    console.log();
    process.stdout.write(
      `${chalk.gray(S_BAR_START)}  ${chalk.bgCyan.bold(` ${title} `)}\n`,
    );
  },
  outro(message = '') {
    process.stdout.write(
      `${chalk.gray(S_BAR)}\n${chalk.gray(S_BAR_END)}  ${chalk.cyan.bold(
        '[DONE]',
      )} ${message}\n\n`,
    );
  },
  title(message: string) {
    this.message(chalk.bgMagenta(` ${message} `), {
      symbol: chalk.gray(S_CONNECT_LEFT),
    });
  },
  cancel: (message = '') => {
    process.stdout.write(`${chalk.gray(S_BAR_END)}  ${chalk.red(message)}\n\n`);
  },
  note,
  isCancel,
};

export default logger;
