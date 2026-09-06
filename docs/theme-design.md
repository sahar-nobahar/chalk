# Theme API Design for Chalk

## Goal

Add a `createTheme` function that lets users define semantic style groups (e.g., `error`, `success`, `warning`) or custom named themes (`dark`, `light`, `highContrast`) using existing chalk chaining. Themes are runtime-switchable without changing imports.

## API Surface

### `createTheme(definition)`

Takes a plain object whose values are chalk style chains. Returns a theme object where each key is a callable function.

```js
import chalk from 'chalk';

const myTheme = chalk.createTheme({
  error: chalk.red.bold,
  success: chalk.green,
  warning: chalk.hex('#FFA500').bold,
  info: chalk.cyan,
});

console.log(myTheme.error('Something failed'));
console.log(myTheme.success('All good'));
```

### Theme Registry & Switching

```js
import {createTheme, setActiveTheme, getActiveTheme} from 'chalk/theme';

const darkTheme = createTheme({
  error: chalk.red.bold,
  success: chalk.green,
});

const lightTheme = createTheme({
  error: chalk.bold.red,
  success: chalk.greenBright,
});

setActiveTheme('dark', darkTheme);
setActiveTheme('light', lightTheme);

setActiveTheme('dark'); // switch
const theme = getActiveTheme();
console.log(theme.error('oops'));
```

### Combined Style Entries

Each theme entry can combine multiple styles (color + bg + modifiers) via standard chaining:

```js
const theme = chalk.createTheme({
  error: chalk.red.bgBlack.bold,
  highlight: chalk.yellow.underline.inverse,
});
```

### Level Fallback

Themes respect the current `chalk.level`. At level 0 all theme functions return plain text. The styler chain is resolved at call time (not at theme creation time), so level changes take effect immediately.

### Error Handling

- `createTheme()` with no arguments or non-object: throws `TypeError`
- Empty object: returns empty theme object (no error)
- Undefined key access: returns `undefined` (standard JS behavior)
- `setActiveTheme(name)` with unknown name: throws `Error`

### Debug Logging

A lightweight, opt-in debug logger is provided:

```js
import {setThemeDebug} from 'chalk/theme';
setThemeDebug(true); // enable debug output to stderr
```

Debug messages include:
- Theme fallback when level changes
- Invalid key access warnings

## Implementation Plan

1. Export internal symbols (`STYLER`, `GENERATOR`, `LEVEL`, `applyStyle`, `createBuilder`, `createStyler`) from `source/index.js` as named exports.
2. Create `source/theme.js` with `createTheme`, registry functions, and debug logger.
3. Add `createTheme` as a method on the chalk instance (delegates to theme.js).
4. Add TypeScript declarations in `source/index.d.ts`.

## Constraints

- No external dependencies
- Theme module only uses chalk's public chaining API internally
- Backward compatible: no existing API breaks
