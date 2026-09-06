import test from 'ava';
import chalk from '../source/index.js';

chalk.level = 3;

test('createTheme: basic smoke test', t => {
	const theme = chalk.createTheme({
		error: chalk.red.bold,
		success: chalk.green,
	});

	t.is(typeof theme.error, 'function');
	t.is(typeof theme.success, 'function');
	t.is(theme.error('fail'), '\u{1B}[31m\u{1B}[1mfail\u{1B}[22m\u{1B}[39m');
	t.is(theme.success('ok'), '\u{1B}[32mok\u{1B}[39m');
});

test('createTheme: empty definition returns empty object', t => {
	const theme = chalk.createTheme({});
	t.deepEqual(Object.keys(theme), []);
});
