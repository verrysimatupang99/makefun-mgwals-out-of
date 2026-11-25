#!/usr/bin/env node
/**
 * out-of-office — a tiny CLI for one very specific auto-reply.
 * Dependency-free JavaScript in a .ts file, documented with editor-friendly
 * TypeScript-flavored JSDoc and runnable directly by Node 22.
 */

const ENTRY_LINE =
  'I am away until Monday re-indexing my peace of mind. For urgent outages: the outage was probably me anyway, so it can wait.';

const PROGRAM_NAME = 'out-of-office';
const VERSION = '1.0.0';
const DEFAULT_WIDTH = 76;
const MIN_WIDTH = 24;
const MAX_WIDTH = 160;

const ANSI = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  dim: '\u001b[2m',
  cyan: '\u001b[36m',
};

/**
 * @typedef {'plain' | 'fancy' | 'json'} OutputMode
 *
 * @typedef {object} CliConfig
 * @property {OutputMode} mode
 * @property {number} width
 * @property {boolean} widthProvided
 * @property {boolean} helpRequested
 * @property {boolean} versionRequested
 *
 * @typedef {object} ParseResult
 * @property {CliConfig | null} config
 * @property {string | null} error
 */

/** @returns {string} */
function helpText() {
  return [
    `${PROGRAM_NAME} ${VERSION}`,
    '',
    'Prints a carefully packaged out-of-office reply.',
    '',
    'Usage:',
    '  node main.ts [options]',
    '',
    'Output modes (choose at most one):',
    '  --plain          Print the reply as plain text (default)',
    '  --fancy          Print the reply in an ANSI-aware box',
    '  --json           Print a machine-readable JSON object',
    '',
    'Other options:',
    `  --width <n>      Wrap display text at n columns (${MIN_WIDTH}-${MAX_WIDTH})`,
    '  --version        Print the version number',
    '  --help           Show this help text',
    '',
    'Examples:',
    '  node main.ts',
    '  node main.ts --fancy --width 64',
    '  node main.ts --json',
    '',
  ].join('\n');
}

/** @returns {boolean} */
function supportsColor() {
  return process.stdout.isTTY && !process.env.NO_COLOR;
}

/**
 * @param {string} text
 * @param {string} style
 * @param {boolean} color
 * @returns {string}
 */
function styled(text, style, color) {
  return color ? `${style}${text}${ANSI.reset}` : text;
}

/**
 * @param {string} raw
 * @returns {number | null}
 */
function parseWidth(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const width = Number.parseInt(raw, 10);
  return width >= MIN_WIDTH && width <= MAX_WIDTH ? width : null;
}

/**
 * Strict hand-rolled argument parser. Unknown flags, positional arguments,
 * repeated options, and conflicting output modes are all usage errors.
 *
 * @param {string[]} args
 * @returns {ParseResult}
 */
function parseArgs(args) {
  /** @type {CliConfig} */
  const config = {
    mode: 'plain',
    width: DEFAULT_WIDTH,
    widthProvided: false,
    helpRequested: false,
    versionRequested: false,
  };
  const seenModes = new Set();

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--help' || arg === '-h') {
      config.helpRequested = true;
      continue;
    }
    if (arg === '--version' || arg === '-v') {
      config.versionRequested = true;
      continue;
    }

    if (arg === '--plain' || arg === '--fancy' || arg === '--json') {
      const mode = arg.slice(2);
      if (seenModes.has(mode)) {
        return { config: null, error: `Option ${arg} was provided more than once.` };
      }
      if (seenModes.size > 0) {
        return { config: null, error: 'Choose only one output mode: --plain, --fancy, or --json.' };
      }
      seenModes.add(mode);
      config.mode = /** @type {OutputMode} */ (mode);
      continue;
    }

    if (arg === '--width' || arg.startsWith('--width=')) {
      if (config.widthProvided) {
        return { config: null, error: 'Option --width was provided more than once.' };
      }

      let rawValue;
      if (arg === '--width') {
        rawValue = args[index + 1];
        index += 1;
      } else {
        rawValue = arg.slice('--width='.length);
      }

      if (rawValue === undefined || rawValue === '') {
        return { config: null, error: 'Option --width requires a numeric value.' };
      }

      const width = parseWidth(rawValue);
      if (width === null) {
        return {
          config: null,
          error: `Invalid width "${rawValue}". Use an integer from ${MIN_WIDTH} to ${MAX_WIDTH}.`,
        };
      }
      config.width = width;
      config.widthProvided = true;
      continue;
    }

    if (arg.startsWith('-')) return { config: null, error: `Unknown option: ${arg}` };
    return { config: null, error: `Unexpected argument: ${arg}` };
  }

  return { config, error: null };
}

/**
 * Wraps at word boundaries. Overlong words are split rather than discarded,
 * so every permitted width still produces the complete canonical message.
 *
 * @param {string} text
 * @param {number} width
 * @returns {string[]}
 */
function wrapText(text, width) {
  /** @type {string[]} */
  const lines = [];
  let current = '';

  for (const word of text.split(' ')) {
    if (word.length > width) {
      if (current) lines.push(current);
      current = '';
      for (let position = 0; position < word.length; position += width) {
        lines.push(word.slice(position, position + width));
      }
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= width) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

/**
 * Plain output is copy-friendly: the canonical line is emitted exactly once
 * unless the user explicitly asks for wrapping.
 *
 * @param {CliConfig} config
 * @returns {string}
 */
function renderPlain(config) {
  if (!config.widthProvided) return `${ENTRY_LINE}\n`;
  return `${wrapText(ENTRY_LINE, config.width).join('\n')}\n`;
}

/**
 * @param {string} text
 * @param {number} innerWidth
 * @param {boolean} color
 * @param {string} [textStyle]
 * @returns {string}
 */
function boxRow(text, innerWidth, color, textStyle = '') {
  const border = styled('│', ANSI.cyan, color);
  const padded = text.padEnd(innerWidth);
  const content = textStyle ? styled(padded, textStyle, color) : padded;
  return `${border} ${content} ${border}`;
}

/**
 * @param {CliConfig} config
 * @returns {string}
 */
function renderFancy(config) {
  const color = supportsColor();
  const innerWidth = config.width - 4;
  const horizontal = '─'.repeat(innerWidth + 2);
  const top = styled(`╭${horizontal}╮`, ANSI.cyan, color);
  const bottom = styled(`╰${horizontal}╯`, ANSI.cyan, color);
  const footer =
    innerWidth >= 40 ? 'back Monday · severity: self-inflicted' : 'back Monday';
  const rows = [
    top,
    boxRow('OUT OF OFFICE', innerWidth, color, ANSI.bold),
    boxRow('', innerWidth, color),
  ];

  for (const line of wrapText(ENTRY_LINE, innerWidth)) {
    rows.push(boxRow(line, innerWidth, color));
  }

  rows.push(boxRow('', innerWidth, color));
  rows.push(boxRow(footer, innerWidth, color, ANSI.dim));
  rows.push(bottom);
  return `${rows.join('\n')}\n`;
}

/** @returns {string} */
function renderJson() {
  return `${JSON.stringify(
    {
      message: ENTRY_LINE,
      awayUntil: 'Monday',
      reason: 're-indexing peace of mind',
      escalation: 'urgent outages can wait',
      version: VERSION,
    },
    null,
    2,
  )}\n`;
}

/** @param {CliConfig} config */
function writePayload(config) {
  if (config.mode === 'json') {
    process.stdout.write(renderJson());
  } else if (config.mode === 'fancy') {
    process.stdout.write(renderFancy(config));
  } else {
    process.stdout.write(renderPlain(config));
  }
}

/**
 * @param {string[]} argv
 * @returns {number} process exit code
 */
function main(argv) {
  const { config, error } = parseArgs(argv.slice(2));

  if (error !== null) {
    process.stderr.write(`${PROGRAM_NAME}: ${error}\n`);
    process.stderr.write(`Try 'node main.ts --help' for usage.\n`);
    return 1;
  }
  if (!config) {
    process.stderr.write(`${PROGRAM_NAME}: unable to parse arguments.\n`);
    return 1;
  }
  if (config.helpRequested) {
    process.stderr.write(helpText());
    return 0;
  }
  if (config.versionRequested) {
    process.stdout.write(`${PROGRAM_NAME} ${VERSION}\n`);
    return 0;
  }

  writePayload(config);
  return 0;
}

process.exitCode = main(process.argv);
