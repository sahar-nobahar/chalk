import test from 'ava';
import chalk, {
	registerTheme,
	setActiveTheme,
	getActiveTheme,
	setThemeDebug,
	Chalk,
} from '../source/index.js';

chalk.level = 3;

// --- createTheme ---

test('createTheme: single style entry', t => {
	const theme = chalk.createTheme({error: chalk.red});
	t.is(theme.error('foo'), '\u{1B}[31mfoo\u{1B}[39m');
});

test('createTheme: combined style entry (color + bg + modifier)', t => {
	const theme = chalk.createTheme({
		error: chalk.red.bgBlack.bold,
	});
	t.is(theme.error('fail'), '\u{1B}[31m\u{1B}[40m\u{1B}[1mfail\u{1B}[22m\u{1B}[49m\u{1B}[39m');
});

test('createTheme: multiple entries', t => {
	const theme = chalk.createTheme({
		error: chalk.red.bold,
		success: chalk.green,
		warning: chalk.hex('#FFA500'),
		info: chalk.cyan,
	});
	t.is(theme.error('e'), '\u{1B}[31m\u{1B}[1me\u{1B}[22m\u{1B}[39m');
	t.is(theme.success('s'), '\u{1B}[32ms\u{1B}[39m');
	t.is(theme.warning('w'), '\u{1B}[38;2;255;165;0mw\u{1B}[39m');
	t.is(theme.info('i'), '\u{1B}[36mi\u{1B}[39m');
});

test('createTheme: multiple arguments per entry', t => {
	const theme = chalk.createTheme({error: chalk.red});
	t.is(theme.error('foo', 'bar'), '\u{1B}[31mfoo bar\u{1B}[39m');
});

test('createTheme: entry with no arguments returns empty string', t => {
	const theme = chalk.createTheme({error: chalk.red});
	t.is(theme.error(), '');
});

test('createTheme: entry with numeric argument', t => {
	const theme = chalk.createTheme({error: chalk.red});
	t.is(theme.error(42), '\u{1B}[31m42\u{1B}[39m');
});

test('createTheme: empty definition returns empty object', t => {
	const theme = chalk.createTheme({});
	t.deepEqual(Object.keys(theme), []);
});

test('createTheme: works with new Chalk instance', t => {
	const instance = new Chalk({level: 3});
	const theme = instance.createTheme({error: instance.red.bold});
	t.is(theme.error('x'), '\u{1B}[31m\u{1B}[1mx\u{1B}[22m\u{1B}[39m');
});

// --- Level fallback ---

test('level fallback: level=0 returns plain text', t => {
	const instance = new Chalk({level: 0});
	const theme = instance.createTheme({
		error: instance.red.bold,
		success: instance.green,
	});
	t.is(theme.error('fail'), 'fail');
	t.is(theme.success('ok'), 'ok');
});

test('level fallback: level change takes effect immediately', t => {
	const instance = new Chalk({level: 3});
	const theme = instance.createTheme({error: instance.red.bold});

	t.is(theme.error('x'), '\u{1B}[31m\u{1B}[1mx\u{1B}[22m\u{1B}[39m');

	instance.level = 0;
	t.is(theme.error('x'), 'x');

	instance.level = 1;
	t.is(theme.error('x'), '\u{1B}[31m\u{1B}[1mx\u{1B}[22m\u{1B}[39m');
});

test('level fallback: level=1 uses basic 16 colors', t => {
	const instance = new Chalk({level: 1});
	const theme = instance.createTheme({
		error: instance.hex('#FF0000'),
	});
	t.is(theme.error('x'), '\u{1B}[91mx\u{1B}[39m');
});

test('level fallback: level=2 uses 256 colors', t => {
	const instance = new Chalk({level: 2});
	const theme = instance.createTheme({
		error: instance.hex('#FF0000'),
	});
	t.is(theme.error('x'), '\u{1B}[38;5;196mx\u{1B}[39m');
});

// --- Nesting in theme entries ---

test('theme entry supports nested styles in argument', t => {
	const theme = chalk.createTheme({error: chalk.red});
	t.is(
		theme.error('foo' + chalk.underline('bar')),
		'\u{1B}[31mfoo\u{1B}[4mbar\u{1B}[24m\u{1B}[39m',
	);
});

// --- Registry ---

test('registerTheme + setActiveTheme by name', t => {
	const theme = chalk.createTheme({error: chalk.red.bold});
	registerTheme('myTheme', theme);

	setActiveTheme('myTheme');
	t.is(getActiveTheme(), theme);
	t.is(getActiveTheme().error('x'), '\u{1B}[31m\u{1B}[1mx\u{1B}[22m\u{1B}[39m');
});

test('setActiveTheme: switch between registered themes', t => {
	const dark = chalk.createTheme({error: chalk.red});
	const light = chalk.createTheme({error: chalk.bold.red});

	registerTheme('dark', dark);
	registerTheme('light', light);

	setActiveTheme('dark');
	t.is(getActiveTheme(), dark);

	setActiveTheme('light');
	t.is(getActiveTheme(), light);
});

test('setActiveTheme: register and set in one call', t => {
	const theme = chalk.createTheme({error: chalk.red});
	setActiveTheme('inline', theme);

	t.is(getActiveTheme(), theme);
});

test('setActiveTheme: direct object (no name)', t => {
	const theme = chalk.createTheme({error: chalk.red});
	setActiveTheme(theme);

	t.is(getActiveTheme(), theme);
});

test('setActiveTheme: unknown name throws', t => {
	t.throws(
		() => setActiveTheme('nonexistent'),
		{message: /not registered/v},
	);
});

// --- Error handling ---

test('createTheme: throws for non-object definition', t => {
	t.throws(() => chalk.createTheme('bad'), {message: /Expected a plain object/v});
	t.throws(() => chalk.createTheme(42), {message: /Expected a plain object/v});
	t.throws(() => chalk.createTheme(null), {message: /Expected a plain object/v});
	t.throws(() => chalk.createTheme(undefined), {message: /Expected a plain object/v});
	t.throws(() => chalk.createTheme([chalk.red]), {message: /Expected a plain object/v});
});

test('createTheme: throws for non-function value', t => {
	t.throws(
		() => chalk.createTheme({error: 'not a function'}),
		{message: /Expected a chalk style chain/v},
	);
	t.throws(
		() => chalk.createTheme({error: 42}),
		{message: /Expected a chalk style chain/v},
	);
});

test('registerTheme: throws for invalid name', t => {
	t.throws(() => registerTheme('', chalk.createTheme({})), {message: /Expected a non-empty string/v});
	t.throws(() => registerTheme(42, chalk.createTheme({})), {message: /Expected a non-empty string/v});
});

test('registerTheme: throws for non-object theme', t => {
	t.throws(() => registerTheme('x', 'bad'), {message: /Expected a theme object/v});
});

// --- Debug logging ---

test('setThemeDebug: enable and disable', t => {
	setThemeDebug(true);
	setThemeDebug(false);
	setThemeDebug(0);
	setThemeDebug(1);
	t.pass(); // eslint-disable-line ava/no-useless-t-pass -- smoke test for no-throw
});

// --- Backward compatibility ---

test('backward compat: existing chalk API still works', t => {
	t.is(chalk.red('foo'), '\u{1B}[31mfoo\u{1B}[39m');
	t.is(chalk.bold('foo'), '\u{1B}[1mfoo\u{1B}[22m');
	t.is(chalk.red.bold('foo'), '\u{1B}[31m\u{1B}[1mfoo\u{1B}[22m\u{1B}[39m');
	t.is(chalk.hex('#FF0000')('foo'), '\u{1B}[38;2;255;0;0mfoo\u{1B}[39m');
	t.is(chalk.level, 3);
});

test('backward compat: createTheme does not break existing instances', t => {
	const instance = new Chalk({level: 1});
	t.is(instance.red('foo'), '\u{1B}[31mfoo\u{1B}[39m');
	const theme = instance.createTheme({err: instance.red});
	t.is(theme.err('bar'), '\u{1B}[31mbar\u{1B}[39m');
	t.is(instance.red('baz'), '\u{1B}[31mbaz\u{1B}[39m');
});
