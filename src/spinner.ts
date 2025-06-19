/* eslint-disable @typescript-eslint/no-use-before-define */
// 复制改造自：https://github.com/natemoo-re/clack/blob/main/packages/prompts/src/index.ts
import { block } from '@clack/core';
import chalk from 'chalk';
import isUnicodeSupported from 'is-unicode-supported';
import { cursor, erase } from 'sisteransi';

import {
  S_BAR,
  S_STEP_CANCEL,
  S_STEP_DONE,
  S_STEP_ERROR,
  S_STEP_SKIPPED,
} from './shared';

const unicode = isUnicodeSupported();

const ERROR_CODE = {
  SUCCESS: 0,
  CANCEL: 1,
  SKIPPED: 2,
  ERROR: 3,
};

const ERROR_MESSAGE = {
  [ERROR_CODE.SUCCESS]: 'Success',
  [ERROR_CODE.CANCEL]: 'Canceled',
  [ERROR_CODE.SKIPPED]: 'Skipped',
  [ERROR_CODE.ERROR]: 'Something went wrong',
};

export const spinner = () => {
  const startTime = Date.now();
  const frames = unicode ? ['◒', '◐', '◓', '◑'] : ['•', 'o', 'O', '0'];
  const delay = unicode ? 80 : 120;

  let unblock: () => void;
  // eslint-disable-next-line no-undef
  let loop: NodeJS.Timeout;
  let isSpinnerActive = false;
  // eslint-disable-next-line no-underscore-dangle
  let _message = '';

  const handleExit = (code: number) => {
    const msg = ERROR_MESSAGE[code];
    if (isSpinnerActive) stop(msg, code);
  };

  const errorEventHandler = () => handleExit(ERROR_CODE.ERROR);
  const signalEventHandler = () => handleExit(ERROR_CODE.CANCEL);

  const registerHooks = () => {
    // Reference: https://nodejs.org/api/process.html#event-uncaughtexception
    process.on('uncaughtExceptionMonitor', errorEventHandler);
    // Reference: https://nodejs.org/api/process.html#event-unhandledrejection
    process.on('unhandledRejection', errorEventHandler);
    // Reference Signal Events: https://nodejs.org/api/process.html#signal-events
    process.on('SIGINT', signalEventHandler);
    process.on('SIGTERM', signalEventHandler);
    process.on('exit', signalEventHandler);
  };

  const clearHooks = () => {
    process.removeListener('uncaughtExceptionMonitor', errorEventHandler);
    process.removeListener('unhandledRejection', errorEventHandler);
    process.removeListener('SIGINT', signalEventHandler);
    process.removeListener('SIGTERM', signalEventHandler);
    process.removeListener('exit', signalEventHandler);
  };

  const start = (msg = '', intervalLine = true): void => {
    isSpinnerActive = true;
    unblock = block();
    _message = msg.replace(/\.+$/u, '');
    if (intervalLine) {
      process.stdout.write(`${chalk.gray(S_BAR)}\n`);
    }
    let frameIndex = 0;
    let dotsTimer = 0;
    registerHooks();
    loop = setInterval(() => {
      const frame = chalk.magenta(frames[frameIndex]);
      const loadingDots = '.'.repeat(Math.floor(dotsTimer)).slice(0, 3);
      process.stdout.write(cursor.move(-999, 0));
      process.stdout.write(erase.down(1));
      process.stdout.write(`${frame}  ${_message}${loadingDots}`);
      frameIndex = frameIndex + 1 < frames.length ? frameIndex + 1 : 0;
      dotsTimer = dotsTimer < frames.length ? dotsTimer + 0.125 : 0;
    }, delay);
  };

  const stop = (msg = '', code = 0): void => {
    _message = msg || _message;
    isSpinnerActive = false;
    clearInterval(loop);

    let step = chalk.red(S_STEP_ERROR);
    if (code === ERROR_CODE.SUCCESS) {
      step = chalk.green(S_STEP_DONE);
    }
    if (code === ERROR_CODE.CANCEL) {
      step = chalk.red(S_STEP_CANCEL);
    }
    if (code === ERROR_CODE.SKIPPED) {
      step = chalk.gray(S_STEP_SKIPPED);
    }
    process.stdout.write(cursor.move(-999, 0));
    process.stdout.write(erase.down(1));
    process.stdout.write(
      `${step}  ${_message} ${chalk.dim(`(${Date.now() - startTime}ms)`)}\n`,
    );
    clearHooks();
    unblock();
  };

  const message = (msg = ''): void => {
    _message = msg ?? _message;
  };

  return {
    start,
    stop,
    message,
  };
};

interface Task {
  /**
   * Task title
   */
  title: string;
  /**
   * Task function
   */
  task: (
    message: (string: string) => void,
  ) => string | Promise<string> | void | Promise<void>;

  /**
   * If enabled === false the task will be skipped
   */
  enabled?: boolean;
}

/**
 * Define a group of tasks to be executed
 */
export const tasks = async (tasks: Task[]) => {
  let index = 0;
  for (const { title, task, enabled = true } of tasks) {
    index++;
    const spin = spinner();
    spin.start(title, index === 1);
    if (enabled) {
      const result = await task(spin.message);
      spin.stop(result || title, ERROR_CODE.SUCCESS);
    } else {
      spin.stop(chalk.gray(`${title} [SKIPPED]`), ERROR_CODE.SKIPPED);
    }
  }
};
