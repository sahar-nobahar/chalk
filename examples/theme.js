import chalk, {
	registerTheme,
	setActiveTheme,
	getActiveTheme,
	setThemeDebug,
} from '../source/index.js';

setThemeDebug(true);

// Define a dark theme
const darkTheme = chalk.createTheme({
	error: chalk.red.bold,
	success: chalk.green,
	warning: chalk.hex('#FFA500').bold,
	info: chalk.cyan,
	title: chalk.bold.underline,
});

// Define a light theme with different styles
const lightTheme = chalk.createTheme({
	error: chalk.bold.red,
	success: chalk.greenBright,
	warning: chalk.hex('#CC8400'),
	info: chalk.blue,
	title: chalk.bold.underline.magenta,
});

// Register and switch between themes
registerTheme('dark', darkTheme);
registerTheme('light', lightTheme);

console.log('\n=== Dark Theme ===');
setActiveTheme('dark');
const theme = getActiveTheme();
console.log(theme.error('Error: something went wrong'));
console.log(theme.success('Success: operation completed'));
console.log(theme.warning('Warning: check your config'));
console.log(theme.info('Info: processing data'));
console.log(theme.title('Dashboard'));

console.log('\n=== Light Theme ===');
setActiveTheme('light');
console.log(theme.error('Error: something went wrong'));
console.log(theme.success('Success: operation completed'));
console.log(theme.warning('Warning: check your config'));
console.log(theme.info('Info: processing data'));
console.log(theme.title('Dashboard'));
