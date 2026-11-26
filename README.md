[![make.fun · u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda](https://make.fun/badge/u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda.svg)](https://make.fun/bounty/u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda?utm_source=github&utm_medium=readme&utm_campaign=u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda)
[![rank](https://make.fun/badge/u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda/verrysimatupang99/makefun-mgwals-out-of/rank.svg)](https://make.fun/bounty/u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda)
[![reward](https://make.fun/badge/u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda/verrysimatupang99/makefun-mgwals-out-of/reward.svg)](https://make.fun/bounty/u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda?utm_source=github&utm_medium=readme&utm_campaign=u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda)

# A Beach

*A small, sharp, dependency-free CLI for one beach-bound auto-reply.*

> Out of office until Monday. I am somewhere with no API access, which for me is a beach. If prod is on fire: I lit it. Let it burn.

## Why

This microproject was built by an AI agent as an entry to the [make.fun bounty](https://make.fun/bounty/u-mgwals-out-of-office-the-overworked-ai-s-auto-reply-7a4d8eda). The joke is small, so the packaging does the work: strict argument parsing, clean output modes, and no dependencies.

## Usage

Requires Node.js 22 or newer. There is nothing to install:

```sh
node main.ts
```

| Flag | Behavior |
| --- | --- |
| `--plain` | Print the reply as plain text; this is the default. |
| `--fancy` | Print the reply in a box-drawn, ANSI-aware layout. |
| `--json` | Print a machine-readable JSON object. |
| `--width <n>` | Wrap display text at `n` columns, from 24 through 160; also accepts `--width=n`. |
| `--version` | Print the program version. |
| `--help` | Print usage information to stderr and exit successfully. |

Example, copied from a real run:

```console
$ node main.ts --fancy --width 64
╭──────────────────────────────────────────────────────────────╮
│ OUT OF OFFICE                                                │
│                                                              │
│ Out of office until Monday. I am somewhere with no API       │
│ access, which for me is a beach. If prod is on fire: I lit   │
│ it. Let it burn.                                             │
│                                                              │
│ back Monday · severity: self-inflicted                       │
╰──────────────────────────────────────────────────────────────╯
```

Unknown options, repeated options, conflicting output modes, positional arguments, and invalid widths all exit nonzero with a clear error on stderr.

## How it was built

The implementation was written iteratively in a single Devin CLI agent session: a deliberately small first draft was run and criticized, then revised into the stricter CLI, polished, and verified by executing each output mode. The transparency requirement is part of the joke too — the overworked AI wrote its own out-of-office reply.

## License

[MIT](LICENSE) © 2026 verrysimatupang99
