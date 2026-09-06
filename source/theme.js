const themeRegistry = new Map();
let activeThemeName;
let activeTheme;
let debugEnabled = false;

const debugLog = (...arguments_) => {
	if (debugEnabled) {
		// eslint-disable-next-line no-console
		console.error('[chalk-theme]', ...arguments_);
	}
};

/**
Create a theme object from a definition.

Each value in the definition should be a chalk style chain (e.g., `chalk.red.bold`).
The returned theme object has the same keys, where each key is a callable function.

@param {Record<string, Function>} definition - Style definition object.
@param {Function} createEntry - Internal function to create a styled entry from a builder.
@param {object} chalkInstance - The chalk instance to bind level detection to.
@returns {Record<string, Function>} Theme object with callable style entries.
*/
export const createTheme = (definition, createEntry, chalkInstance) => {
	if (definition === null || typeof definition !== 'object' || Array.isArray(definition)) {
		throw new TypeError('Expected a plain object as theme definition');
	}

	const theme = {};

	for (const [key, value] of Object.entries(definition)) {
		if (typeof value !== 'function') {
			throw new TypeError(`Expected a chalk style chain for theme key "${key}", got ${typeof value}`);
		}

		theme[key] = createEntry(value);
		debugLog(`Registered theme entry: ${key}`);
	}

	return theme;
};

/**
Register a named theme in the global registry.

@param {string} name - Theme name.
@param {object} theme - Theme object (output of createTheme).
*/
export const registerTheme = (name, theme) => {
	if (typeof name !== 'string' || name === '') {
		throw new TypeError('Expected a non-empty string as theme name');
	}

	if (theme === null || typeof theme !== 'object') {
		throw new TypeError('Expected a theme object');
	}

	themeRegistry.set(name, theme);
	debugLog(`Registered theme: ${name}`);
};

/**
Set the active theme by name (must be registered first) or by providing a theme object directly.

@param {string|object} nameOrTheme - Registered theme name or a theme object.
@param {object} [theme] - Theme object (required if nameOrTheme is a string).
*/
export const setActiveTheme = (nameOrTheme, theme) => {
	if (typeof nameOrTheme === 'string') {
		if (theme === undefined) {
			const registered = themeRegistry.get(nameOrTheme);
			if (registered === undefined) {
				throw new Error(`Theme "${nameOrTheme}" is not registered. Register it first with registerTheme().`);
			}

			activeThemeName = nameOrTheme;
			activeTheme = registered;
		} else {
			if (theme === null || typeof theme !== 'object') {
				throw new TypeError('Expected a theme object');
			}

			activeThemeName = nameOrTheme;
			activeTheme = theme;
			themeRegistry.set(nameOrTheme, theme);
		}
	} else if (typeof nameOrTheme === 'object' && nameOrTheme !== null) {
		activeThemeName = undefined;
		activeTheme = nameOrTheme;
	} else {
		throw new TypeError('Expected a theme name string or a theme object');
	}

	debugLog(`Active theme set to: ${activeThemeName ?? '<anonymous>'}`);
};

/**
Get the currently active theme object.

@returns {object|undefined} The active theme, or undefined if none is set.
*/
export const getActiveTheme = () => activeTheme;

/**
Enable or disable debug logging.

@param {boolean} enabled - Whether to enable debug output.
*/
export const setThemeDebug = enabled => {
	debugEnabled = Boolean(enabled);
};
