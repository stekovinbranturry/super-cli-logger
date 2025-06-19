/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-lines */
// @ts-nocheck
import {
  ConfirmPrompt,
  GroupMultiSelectPrompt,
  MultiSelectPrompt,
  PasswordPrompt,
  SelectKeyPrompt,
  SelectPrompt,
  TextPrompt,
  isCancel,
} from '@clack/core';
import chalk from 'chalk';

import {
  S_BAR,
  S_BAR_END,
  S_CHECKBOX_ACTIVE,
  S_CHECKBOX_INACTIVE,
  S_CHECKBOX_SELECTED,
  S_PASSWORD_MASK,
  S_RADIO_ACTIVE,
  S_RADIO_INACTIVE,
  symbol,
} from './shared';

interface LimitOptionsParams<TOption> {
  options: TOption[];
  maxItems: number | undefined;
  cursor: number;
  style: (option: TOption, active: boolean) => string;
}

const limitOptions = <TOption>(
  params: LimitOptionsParams<TOption>,
): string[] => {
  const { cursor, options, style } = params;

  const paramMaxItems = params.maxItems ?? Number.POSITIVE_INFINITY;
  const outputMaxItems = Math.max(process.stdout.rows - 4, 0);
  // We clamp to minimum 5 because anything less doesn't make sense UX wise
  const maxItems = Math.min(outputMaxItems, Math.max(paramMaxItems, 5));
  let slidingWindowLocation = 0;

  if (cursor >= slidingWindowLocation + maxItems - 3) {
    slidingWindowLocation = Math.max(
      Math.min(cursor - maxItems + 3, options.length - maxItems),
      0,
    );
  } else if (cursor < slidingWindowLocation + 2) {
    slidingWindowLocation = Math.max(cursor - 2, 0);
  }

  const shouldRenderTopEllipsis =
    maxItems < options.length && slidingWindowLocation > 0;
  const shouldRenderBottomEllipsis =
    maxItems < options.length &&
    slidingWindowLocation + maxItems < options.length;

  return options
    .slice(slidingWindowLocation, slidingWindowLocation + maxItems)
    .map((option, i, arr) => {
      const isTopLimit = i === 0 && shouldRenderTopEllipsis;
      const isBottomLimit = i === arr.length - 1 && shouldRenderBottomEllipsis;
      return isTopLimit || isBottomLimit
        ? chalk.dim('...')
        : style(option, i + slidingWindowLocation === cursor);
    });
};

export interface TextOptions {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  initialValue?: string;
  validate?: (value: string) => string | undefined;
}
export const text = async (opts: TextOptions) => {
  return new TextPrompt({
    validate: opts.validate,
    placeholder: opts.placeholder,
    defaultValue: opts.defaultValue,
    initialValue: opts.initialValue,
    render() {
      const title = `${chalk.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;
      const placeholder = opts.placeholder
        ? chalk.inverse(opts.placeholder[0]) +
          chalk.dim(opts.placeholder.slice(1))
        : chalk.inverse(chalk.hidden('_'));
      const value = !this.value ? placeholder : this.valueWithCursor;

      switch (this.state) {
        case 'error':
          return `${title.trim()}\n${chalk.yellow(S_BAR)}  ${value}\n${chalk.yellow(
            S_BAR_END,
          )}  ${chalk.yellow(this.error)}\n`;
        case 'submit':
          return `${title}${chalk.gray(S_BAR)}  ${chalk.dim(this.value || opts.placeholder)}`;
        case 'cancel':
          return `${title}${chalk.gray(S_BAR)}  ${chalk.strikethrough(
            chalk.dim(this.value ?? ''),
          )}${this.value?.trim() ? `\n${chalk.gray(S_BAR)}` : ''}`;
        default:
          return `${title}${chalk.cyan(S_BAR)}  ${value}\n${chalk.cyan(S_BAR_END)}\n`;
      }
    },
  }).prompt() as Promise<string>;
};

export interface PasswordOptions {
  message: string;
  mask?: string;
  validate?: (value: string) => string | undefined;
}
export const password = async (opts: PasswordOptions) => {
  return new PasswordPrompt({
    validate: opts.validate,
    mask: opts.mask ?? S_PASSWORD_MASK,
    render() {
      const title = `${chalk.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;
      const value = this.valueWithCursor;
      const { masked } = this;

      switch (this.state) {
        case 'error':
          return `${title.trim()}\n${chalk.yellow(S_BAR)}  ${masked}\n${chalk.yellow(
            S_BAR_END,
          )}  ${chalk.yellow(this.error)}\n`;
        case 'submit':
          return `${title}${chalk.gray(S_BAR)}  ${chalk.dim(masked)}`;
        case 'cancel':
          return `${title}${chalk.gray(S_BAR)}  ${chalk.strikethrough(chalk.dim(masked ?? ''))}${
            masked ? `\n${chalk.gray(S_BAR)}` : ''
          }`;
        default:
          return `${title}${chalk.cyan(S_BAR)}  ${value}\n${chalk.cyan(S_BAR_END)}\n`;
      }
    },
  }).prompt() as Promise<string>;
};

export interface ConfirmOptions {
  message: string;
  active?: string;
  inactive?: string;
  initialValue?: boolean;
}
export const confirm = async (opts: ConfirmOptions) => {
  const active = opts.active ?? 'Yes';
  const inactive = opts.inactive ?? 'No';
  return new ConfirmPrompt({
    active,
    inactive,
    initialValue: opts.initialValue ?? true,
    render() {
      const title = `${chalk.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;
      const value = this.value ? active : inactive;

      switch (this.state) {
        case 'submit':
          return `${title}${chalk.gray(S_BAR)}  ${chalk.dim(value)}`;
        case 'cancel':
          return `${title}${chalk.gray(S_BAR)}  ${chalk.strikethrough(
            chalk.dim(value),
          )}\n${chalk.gray(S_BAR)}`;
        default: {
          return `${title}${chalk.cyan(S_BAR)}  ${
            this.value
              ? `${chalk.green(S_RADIO_ACTIVE)} ${active}`
              : `${chalk.dim(S_RADIO_INACTIVE)} ${chalk.dim(active)}`
          } ${chalk.dim('/')} ${
            !this.value
              ? `${chalk.green(S_RADIO_ACTIVE)} ${inactive}`
              : `${chalk.dim(S_RADIO_INACTIVE)} ${chalk.dim(inactive)}`
          }\n${chalk.cyan(S_BAR_END)}\n`;
        }
      }
    },
  }).prompt() as Promise<boolean>;
};

type Primitive = Readonly<string | boolean | number>;

type Option<Value> = Value extends Primitive
  ? { value: Value; label?: string; hint?: string }
  : { value: Value; label: string; hint?: string };

export interface SelectOptions<Value> {
  message: string;
  options: Option<Value>[];
  initialValue?: Value;
  maxItems?: number;
}

export const select = async <Value>(opts: SelectOptions<Value>) => {
  const opt = (
    option: Option<Value>,
    state: 'inactive' | 'active' | 'selected' | 'cancelled',
  ) => {
    const label = option.label ?? String(option.value);
    switch (state) {
      case 'selected':
        return `${chalk.dim(label)}`;
      case 'active':
        return `${chalk.green(S_RADIO_ACTIVE)} ${label} ${
          option.hint ? chalk.dim(`(${option.hint})`) : ''
        }`;
      case 'cancelled':
        return `${chalk.strikethrough(chalk.dim(label))}`;
      default:
        return `${chalk.dim(S_RADIO_INACTIVE)} ${chalk.dim(label)}`;
    }
  };

  return new SelectPrompt({
    options: opts.options,
    initialValue: opts.initialValue,
    render() {
      const title = `${chalk.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;

      switch (this.state) {
        case 'submit':
          return `${title}${chalk.gray(S_BAR)}  ${opt(this.options[this.cursor], 'selected')}`;
        case 'cancel':
          return `${title}${chalk.gray(S_BAR)}  ${opt(
            this.options[this.cursor],
            'cancelled',
          )}\n${chalk.gray(S_BAR)}`;
        default: {
          return `${title}${chalk.cyan(S_BAR)}  ${limitOptions({
            cursor: this.cursor,
            options: this.options,
            maxItems: opts.maxItems,
            style: (item, active) => opt(item, active ? 'active' : 'inactive'),
          }).join(`\n${chalk.cyan(S_BAR)}  `)}\n${chalk.cyan(S_BAR_END)}\n`;
        }
      }
    },
  }).prompt() as Promise<Value>;
};

export const selectKey = async <Value extends string>(
  opts: SelectOptions<Value>,
) => {
  const opt = (
    option: Option<Value>,
    state: 'inactive' | 'active' | 'selected' | 'cancelled' = 'inactive',
  ) => {
    const label = option.label ?? String(option.value);
    if (state === 'selected') {
      return `${chalk.dim(label)}`;
    }
    if (state === 'cancelled') {
      return `${chalk.strikethrough(chalk.dim(label))}`;
    }
    if (state === 'active') {
      return `${chalk.bgCyan(chalk.gray(` ${option.value} `))} ${label} ${
        option.hint ? chalk.dim(`(${option.hint})`) : ''
      }`;
    }
    return `${chalk.gray(chalk.bgWhite(chalk.inverse(` ${option.value} `)))} ${label} ${
      option.hint ? chalk.dim(`(${option.hint})`) : ''
    }`;
  };

  return new SelectKeyPrompt({
    options: opts.options,
    initialValue: opts.initialValue,
    render() {
      const title = `${chalk.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;

      switch (this.state) {
        case 'submit':
          return `${title}${chalk.gray(S_BAR)}  ${opt(
            this.options.find((opt) => opt.value === this.value),
            'selected',
          )}`;
        case 'cancel':
          return `${title}${chalk.gray(S_BAR)}  ${opt(this.options[0], 'cancelled')}\n${chalk.gray(
            S_BAR,
          )}`;
        default: {
          return `${title}${chalk.cyan(S_BAR)}  ${this.options
            .map((option, i) =>
              opt(option, i === this.cursor ? 'active' : 'inactive'),
            )
            .join(`\n${chalk.cyan(S_BAR)}  `)}\n${chalk.cyan(S_BAR_END)}\n`;
        }
      }
    },
  }).prompt() as Promise<Value>;
};

export interface MultiSelectOptions<Value> {
  message: string;
  options: Option<Value>[];
  initialValues?: Value[];
  maxItems?: number;
  required?: boolean;
  cursorAt?: Value;
}
export const multiselect = async <Value>(opts: MultiSelectOptions<Value>) => {
  const opt = (
    option: Option<Value>,
    state:
      | 'inactive'
      | 'active'
      | 'selected'
      | 'active-selected'
      | 'submitted'
      | 'cancelled',
  ) => {
    const label = option.label ?? String(option.value);
    if (state === 'active') {
      return `${chalk.cyan(S_CHECKBOX_ACTIVE)} ${label} ${
        option.hint ? chalk.dim(`(${option.hint})`) : ''
      }`;
    }
    if (state === 'selected') {
      return `${chalk.green(S_CHECKBOX_SELECTED)} ${chalk.dim(label)}`;
    }
    if (state === 'cancelled') {
      return `${chalk.strikethrough(chalk.dim(label))}`;
    }
    if (state === 'active-selected') {
      return `${chalk.green(S_CHECKBOX_SELECTED)} ${label} ${
        option.hint ? chalk.dim(`(${option.hint})`) : ''
      }`;
    }
    if (state === 'submitted') {
      return `${chalk.dim(label)}`;
    }
    return `${chalk.dim(S_CHECKBOX_INACTIVE)} ${chalk.dim(label)}`;
  };

  return new MultiSelectPrompt({
    options: opts.options,
    initialValues: opts.initialValues,
    required: opts.required ?? true,
    cursorAt: opts.cursorAt,
    validate(selected: Value[]) {
      if (this.required && selected.length === 0)
        return `Please select at least one option.\n${chalk.reset(
          chalk.dim(
            `Press ${chalk.gray(chalk.bgWhite(chalk.inverse(' space ')))} to select, ${chalk.gray(
              chalk.bgWhite(chalk.inverse(' enter ')),
            )} to submit`,
          ),
        )}`;
    },
    render() {
      const title = `${chalk.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;

      const styleOption = (option: Option<Value>, active: boolean) => {
        const selected = this.value.includes(option.value);
        if (active && selected) {
          return opt(option, 'active-selected');
        }
        if (selected) {
          return opt(option, 'selected');
        }
        return opt(option, active ? 'active' : 'inactive');
      };

      switch (this.state) {
        case 'submit': {
          return `${title}${chalk.gray(S_BAR)}  ${
            this.options
              .filter(({ value }) => this.value.includes(value))
              .map((option) => opt(option, 'submitted'))
              .join(chalk.dim(', ')) || chalk.dim('none')
          }`;
        }
        case 'cancel': {
          const label = this.options
            .filter(({ value }) => this.value.includes(value))
            .map((option) => opt(option, 'cancelled'))
            .join(chalk.dim(', '));
          return `${title}${chalk.gray(S_BAR)}  ${
            label.trim() ? `${label}\n${chalk.gray(S_BAR)}` : ''
          }`;
        }
        case 'error': {
          const footer = this.error
            .split('\n')
            .map((ln, i) =>
              i === 0
                ? `${chalk.yellow(S_BAR_END)}  ${chalk.yellow(ln)}`
                : `   ${ln}`,
            )
            .join('\n');
          return `${title + chalk.yellow(S_BAR)}  ${limitOptions({
            options: this.options,
            cursor: this.cursor,
            maxItems: opts.maxItems,
            style: styleOption,
          }).join(`\n${chalk.yellow(S_BAR)}  `)}\n${footer}\n`;
        }
        default: {
          return `${title}${chalk.cyan(S_BAR)}  ${limitOptions({
            options: this.options,
            cursor: this.cursor,
            maxItems: opts.maxItems,
            style: styleOption,
          }).join(`\n${chalk.cyan(S_BAR)}  `)}\n${chalk.cyan(S_BAR_END)}\n`;
        }
      }
    },
  }).prompt() as Promise<Value[]>;
};

export interface GroupMultiSelectOptions<Value> {
  message: string;
  options: Record<string, Option<Value>[]>;
  initialValues?: Value[];
  required?: boolean;
  cursorAt?: Value;
}
export const groupMultiselect = async <Value>(
  opts: GroupMultiSelectOptions<Value>,
) => {
  const opt = (
    option: Option<Value>,
    state:
      | 'inactive'
      | 'active'
      | 'selected'
      | 'active-selected'
      | 'group-active'
      | 'group-active-selected'
      | 'submitted'
      | 'cancelled',
    options: Option<Value>[] = [],
  ) => {
    const label = option.label ?? String(option.value);
    const isItem = typeof option.group === 'string';
    const next =
      isItem && (options[options.indexOf(option) + 1] ?? { group: true });
    const isLast = isItem && next.group === true;
    const prefix = isItem ? `${isLast ? S_BAR_END : S_BAR} ` : '';

    if (state === 'active') {
      return `${chalk.dim(prefix)}${chalk.cyan(S_CHECKBOX_ACTIVE)} ${label} ${
        option.hint ? chalk.dim(`(${option.hint})`) : ''
      }`;
    }
    if (state === 'group-active') {
      return `${prefix}${chalk.cyan(S_CHECKBOX_ACTIVE)} ${chalk.dim(label)}`;
    }
    if (state === 'group-active-selected') {
      return `${prefix}${chalk.green(S_CHECKBOX_SELECTED)} ${chalk.dim(label)}`;
    }
    if (state === 'selected') {
      return `${chalk.dim(prefix)}${chalk.green(S_CHECKBOX_SELECTED)} ${chalk.dim(label)}`;
    }
    if (state === 'cancelled') {
      return `${chalk.strikethrough(chalk.dim(label))}`;
    }
    if (state === 'active-selected') {
      return `${chalk.dim(prefix)}${chalk.green(S_CHECKBOX_SELECTED)} ${label} ${
        option.hint ? chalk.dim(`(${option.hint})`) : ''
      }`;
    }
    if (state === 'submitted') {
      return `${chalk.dim(label)}`;
    }
    return `${chalk.dim(prefix)}${chalk.dim(S_CHECKBOX_INACTIVE)} ${chalk.dim(label)}`;
  };

  return new GroupMultiSelectPrompt({
    options: opts.options,
    initialValues: opts.initialValues,
    required: opts.required ?? true,
    cursorAt: opts.cursorAt,
    validate(selected: Value[]) {
      if (this.required && selected.length === 0)
        return `Please select at least one option.\n${chalk.reset(
          chalk.dim(
            `Press ${chalk.gray(chalk.bgWhite(chalk.inverse(' space ')))} to select, ${chalk.gray(
              chalk.bgWhite(chalk.inverse(' enter ')),
            )} to submit`,
          ),
        )}`;
    },
    render() {
      const title = `${chalk.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;

      switch (this.state) {
        case 'submit': {
          return `${title}${chalk.gray(S_BAR)}  ${this.options
            .filter(({ value }) => this.value.includes(value))
            .map((option) => opt(option, 'submitted'))
            .join(chalk.dim(', '))}`;
        }
        case 'cancel': {
          const label = this.options
            .filter(({ value }) => this.value.includes(value))
            .map((option) => opt(option, 'cancelled'))
            .join(chalk.dim(', '));
          return `${title}${chalk.gray(S_BAR)}  ${
            label.trim() ? `${label}\n${chalk.gray(S_BAR)}` : ''
          }`;
        }
        case 'error': {
          const footer = this.error
            .split('\n')
            .map((ln, i) =>
              i === 0
                ? `${chalk.yellow(S_BAR_END)}  ${chalk.yellow(ln)}`
                : `   ${ln}`,
            )
            .join('\n');
          return `${title}${chalk.yellow(S_BAR)}  ${this.options
            .map((option, i, options) => {
              const selected =
                this.value.includes(option.value) ||
                (option.group === true &&
                  this.isGroupSelected(`${option.value}`));
              const active = i === this.cursor;
              const groupActive =
                !active &&
                typeof option.group === 'string' &&
                this.options[this.cursor].value === option.group;
              if (groupActive) {
                return opt(
                  option,
                  selected ? 'group-active-selected' : 'group-active',
                  options,
                );
              }
              if (active && selected) {
                return opt(option, 'active-selected', options);
              }
              if (selected) {
                return opt(option, 'selected', options);
              }
              return opt(option, active ? 'active' : 'inactive', options);
            })
            .join(`\n${chalk.yellow(S_BAR)}  `)}\n${footer}\n`;
        }
        default: {
          return `${title}${chalk.cyan(S_BAR)}  ${this.options
            .map((option, i, options) => {
              const selected =
                this.value.includes(option.value) ||
                (option.group === true &&
                  this.isGroupSelected(`${option.value}`));
              const active = i === this.cursor;
              const groupActive =
                !active &&
                typeof option.group === 'string' &&
                this.options[this.cursor].value === option.group;
              if (groupActive) {
                return opt(
                  option,
                  selected ? 'group-active-selected' : 'group-active',
                  options,
                );
              }
              if (active && selected) {
                return opt(option, 'active-selected', options);
              }
              if (selected) {
                return opt(option, 'selected', options);
              }
              return opt(option, active ? 'active' : 'inactive', options);
            })
            .join(`\n${chalk.cyan(S_BAR)}  `)}\n${chalk.cyan(S_BAR_END)}\n`;
        }
      }
    },
  }).prompt() as Promise<Value[]>;
};

export interface LogMessageOptions {
  symbol?: string;
}

// Adapted from https://github.com/chalk/ansi-regex
// @see LICENSE

export type PromptGroupAwaitedReturn<T> = {
  [P in keyof T]: Exclude<Awaited<T[P]>>;
};

export interface PromptGroupOptions<T> {
  /**
   * Control how the group can be canceled if one of the prompts is canceled.
   */
  onCancel?: (opts: {
    results: Prettify<Partial<PromptGroupAwaitedReturn<T>>>;
  }) => void;
}

type Prettify<T> = {
  [P in keyof T]: T[P];
};

export type PromptGroup<T> = {
  [P in keyof T]: (opts: { results: T }) =>
    | undefined
    | Promise<T[P] | undefined>;
};

/**
 * Define a group of prompts to be displayed and return a results of objects within the group
 */
export const group = async <T>(
  prompts: PromptGroup<T>,
  opts?: PromptGroupOptions<T>,
): Promise<Prettify<PromptGroupAwaitedReturn<T>>> => {
  const results = {} as T;
  const promptNames = Object.keys(prompts);

  for (const name of promptNames) {
    const prompt = prompts[name as keyof T];
    const result = await prompt({ results })?.catch((e) => {
      throw e;
    });

    // Pass the results to the onCancel function
    // so the user can decide what to do with the results
    // TODO: Switch to callback within core to avoid isCancel Fn
    if (typeof opts?.onCancel === 'function' && isCancel(result)) {
      results[name] = 'canceled';
      opts.onCancel({ results });
    }

    results[name] = result;
  }

  return results;
};
