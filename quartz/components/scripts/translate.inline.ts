import { joinSegments, isFolderPath } from "../../util/path"

// Define callbacks at module scope to maintain fixed references
let toggleDropdown: ((e: MouseEvent) => void) | null = null;
let closeDropdownOutside: ((e: MouseEvent) => void) | null = null;

// Cache for detected language and dropdown creation state
let detectedUserLanguageCache: string | null = null;
let dropdownCreated = false;

// Language name mapping based on ISO 639-1 codes
const languageNames: Record<string, string> = {
	'en': 'English',
	'vi': 'Tiếng Việt',
	'ja': '日本語',
	'zh': '中文',
	'ko': '한국어',
	'fr': 'Français',
	'de': 'Deutsch',
	'es': 'Español',
	'pt': 'Português',
	'ru': 'Русский',
	'ar': 'العربية',
	'hi': 'हिन्दी',
	'it': 'Italiano',
};

function navigateToPath(path: string): void {
	const url = new URL(path, window.location.toString());

	if (path.includes('/no-translation-available')) {
		window.location.href = path;
		return;
	}

	if (typeof window.spaNavigate === 'function') {
		try {
			window.spaNavigate(url);
			return;
		} catch (error) {
			console.warn('SPA navigation failed, falling back to regular navigation', error);
		}
	}

	window.location.href = path;
}

// Function to detect user's language based on browser settings with caching
function detectUserLanguage(availableLanguages: string[], defaultLanguage: string): string {
	// Use cached value if available
	if (detectedUserLanguageCache !== null) {
		return detectedUserLanguageCache;
	}

	try {
		// Get browser languages
		const browserLanguages = navigator.languages || [navigator.language];

		// Try to match with available languages
		for (const browserLang of browserLanguages) {
			// Try to match the full locale code first (e.g., 'en-US')
			if (availableLanguages.includes(browserLang)) {
				detectedUserLanguageCache = browserLang;
				return browserLang;
			}

			// Try to match just the primary language part (e.g., 'en' from 'en-US')
			const primaryLang = browserLang.split('-')[0].toLowerCase();
			if (availableLanguages.includes(primaryLang)) {
				detectedUserLanguageCache = primaryLang;
				return primaryLang;
			}
		}

		// If no match found, cache and return default language
		detectedUserLanguageCache = defaultLanguage;
		return defaultLanguage;
	} catch (error) {
		console.error("Error detecting user language:", error);
		detectedUserLanguageCache = defaultLanguage;
		return defaultLanguage;
	}
}

// Helper function to normalize paths according to Quartz conventions
function normalizePath(path: string): string {
	// Handle index paths correctly
	if (isFolderPath(path)) {
		// Convert /folder/index to /folder/
		const parentFolder = path.substring(0, path.lastIndexOf('/') + 1);
		return parentFolder;
	}

	return path;
}

// Check if content exists and handle fallback for non-existent translations
function checkContentExists(path: string): Promise<{ exists: boolean, originalPath?: string }> {
	return new Promise((resolve) => {
		// Use fetch with HEAD method to check if page exists
		fetch(path, { method: 'HEAD' })
			.then(response => {
				if (response.status === 200) {
					resolve({ exists: true });
				} else {
					resolve({ exists: false });
				}
			})
			.catch(() => {
				// In case of network errors, assume content exists to avoid incorrect redirects
				resolve({ exists: true });
			});
	});
}

// Function to create language path using Quartz utilities
function createLanguagePath(lang: string, currentLanguage: string, pathParts: string[], defaultLanguage: string, currentPath: string): string {
	// Build the target path based on language
	let targetPath: string;

	if (lang === defaultLanguage) {
		// For default language, remove any language prefix
		if (currentLanguage && pathParts.length > 1) {
			// Use joinSegments to properly create the path
			targetPath = joinSegments('/', ...pathParts.slice(1));
		} else {
			targetPath = joinSegments('/', currentPath);
		}
	} else {
		if (currentLanguage) {
			// Replace current language with new language
			targetPath = joinSegments('/', lang, ...pathParts.slice(1));
		} else {
			// Add language prefix
			targetPath = joinSegments('/', lang, currentPath);
		}
	}

	// Normalize the path according to Quartz conventions
	return normalizePath(targetPath);
}

// Function to redirect to the appropriate language version with optimized performance
function redirectToUserLanguage() {
	const languageButton = document.getElementById('language-button');
	if (!languageButton) return;

	// Get configuration from data attributes
	const languagesStr = languageButton.getAttribute('data-languages');
	const languages = languagesStr ? JSON.parse(languagesStr) : ["en", "vi"];
	const defaultLanguage = languageButton.getAttribute('data-default-language') || 'en';
	const currentPath = languageButton.getAttribute('data-current-path') || '';

	// Check if already on a language path
	const pathParts = currentPath.split('/').filter(p => p);
	if (pathParts[0] && languages.includes(pathParts[0])) {
		// Already on a language-specific path
		return;
	}

	// Detect user's language
	const userLanguage = detectUserLanguage(languages, defaultLanguage);

	// Don't redirect if user language is the default language
	if (userLanguage === defaultLanguage) {
		return;
	}

	// Build the new path with the detected language using Quartz utilities
	const newPath = createLanguagePath(userLanguage, '', pathParts, defaultLanguage, currentPath);

	// Check if content exists for this language before redirecting
	checkContentExists(newPath)
		.then(result => {
			if (result.exists) {
				// Content exists, redirect to translated page
				navigateToPath(newPath);
			} else {
				// Content doesn't exist, handle fallback to no-translation page
				// Calculate original path (in default language)
				const originalPath = currentPath;
				// Generate path to no-translation page with query parameters
				const noTranslationPath = `/no-translation-available?originalPath=${encodeURIComponent(originalPath)}`;
				// Redirect to the no-translation page
				navigateToPath(noTranslationPath);
			}
		})
		.catch(() => {
			console.warn(`Couldn't verify content for language ${userLanguage}, not redirecting.`);
		});
}

// Efficiently create or update dropdown using DocumentFragment
function createLanguageDropdown(): HTMLElement | null {
	// Get dropdown if it exists, or create a new one
	let dropdown = document.getElementById('language-dropdown');
	const isNew = !dropdown;

	if (isNew) {
		dropdown = document.createElement('div');
		dropdown.className = 'language-dropdown';
		dropdown.id = 'language-dropdown';
	} else if (!dropdown) {
		return null;
	}

	const languageButton = document.getElementById('language-button');
	if (!languageButton) return null;

	// Get data from data attributes
	const languagesStr = languageButton.getAttribute('data-languages');
	const languages = languagesStr ? JSON.parse(languagesStr) : ["en", "vi"];
	const defaultLanguage = languageButton.getAttribute('data-default-language') || 'en';
	const currentPath = languageButton.getAttribute('data-current-path') || '';

	// Detect current language from path
	const pathParts = currentPath.split('/').filter(p => p);
	let currentLanguage = '';

	if (pathParts[0] && languages.includes(pathParts[0])) {
		currentLanguage = pathParts[0];
	}

	// Use DocumentFragment to reduce reflows
	const fragment = document.createDocumentFragment();

	languages.forEach((lang: string) => {
		// Get the language name, fallback to the code if not in our mapping
		const langName = languageNames[lang] || lang;

		// Determine the path for this language option using Quartz utilities
		const targetPath = createLanguagePath(lang, currentLanguage, pathParts, defaultLanguage, currentPath);

		// Mark current language as active
		const isActive = lang === currentLanguage ||
			(currentLanguage === '' && lang === defaultLanguage);

		// Create option element
		const option = document.createElement('a');
		option.href = targetPath;
		option.className = `language-option ${isActive ? 'active' : ''}`;
		option.setAttribute('data-lang', lang);

		// Add click event to verify content exists before navigating
		option.addEventListener('click', function (e) {
			// Only intercept if not the current active language
			if (!isActive) {
				e.preventDefault();

				// Check if content exists for this language
				checkContentExists(targetPath)
					.then(result => {
						if (result.exists) {
							// Content exists, navigate to translated page using SPA navigation
							navigateToPath(targetPath);
						} else {
							// Content doesn't exist, calculate original path to return to
							let originalPath;
							if (currentLanguage && currentLanguage !== defaultLanguage) {
								// If we're on a non-default language page, use path without language prefix
								originalPath = '/' + pathParts.slice(1).join('/');
							} else {
								// If we're on the default language, use current path
								originalPath = currentPath;
							}

							// Generate path to no-translation page with query parameters
							const noTranslationPath = `/no-translation-available?originalPath=${encodeURIComponent(originalPath)}`;
							// Redirect to the no-translation page
							navigateToPath(noTranslationPath);
						}
					})
					.catch(() => {
						// On error, just try to navigate directly
						navigateToPath(targetPath);
					});
			}
		});

		// Create flag span
		const flagSpan = document.createElement('span');
		flagSpan.className = 'language-flag';
		flagSpan.textContent = lang.toUpperCase();

		// Create name span
		const nameSpan = document.createElement('span');
		nameSpan.className = 'language-name';
		nameSpan.textContent = langName;

		// Append elements
		option.appendChild(flagSpan);
		option.appendChild(nameSpan);
		fragment.appendChild(option);
	});

	// Clear and update dropdown content
	dropdown.innerHTML = '';
	dropdown.appendChild(fragment);

	// Add to document if it's new
	if (isNew) {
		document.body.appendChild(dropdown);
	}

	return dropdown;
}

// Calculate dropdown position based on button position
function positionDropdown() {
	const languageButton = document.getElementById('language-button');
	const dropdown = document.getElementById('language-dropdown');

	if (!languageButton || !dropdown) return;

	const buttonRect = languageButton.getBoundingClientRect();

	// Initial position below button, left-aligned
	dropdown.style.top = `${buttonRect.bottom}px`;
	dropdown.style.left = `${buttonRect.left}px`;

	// Check if dropdown will be cut off by right edge of screen
	const dropdownRect = dropdown.getBoundingClientRect();
	if (dropdownRect.right > window.innerWidth) {
		dropdown.style.left = `${buttonRect.right - dropdownRect.width}px`;
	}

	// Check if dropdown will be cut off by bottom edge of screen
	if (dropdownRect.bottom > window.innerHeight) {
		dropdown.style.top = `${buttonRect.top - dropdownRect.height}px`;
	}
}

// Update language UI based on current URL
function updateLanguageUI() {
	// Reset dropdown state
	dropdownCreated = false;
}

// Setup event handlers with lazy dropdown creation
function setupTranslateEvents() {
	const languageButton = document.getElementById('language-button');
	if (!languageButton) {
		// Button not created yet, retry with exponential backoff
		if (!(window as any).__TranslateRetry) (window as any).__TranslateRetry = 0;
		if ((window as any).__TranslateRetry++ < 8) {
			const delay = Math.min(50 * Math.pow(1.5, (window as any).__TranslateRetry), 2000);
			setTimeout(setupTranslateEvents, delay);
		}
		return;
	}

	// Update the UI based on current URL
	updateLanguageUI();

	// Remove old events if they exist
	if (toggleDropdown) languageButton.removeEventListener('click', toggleDropdown);
	if (closeDropdownOutside) document.removeEventListener('click', closeDropdownOutside);

	// Create new events with lazy dropdown creation
	toggleDropdown = function (e: MouseEvent) {
		e.stopPropagation();

		// Lazy create dropdown on first click
		if (!dropdownCreated) {
			createLanguageDropdown();
			dropdownCreated = true;
		}

		const dropdown = document.getElementById('language-dropdown');
		if (!dropdown) return;

		// Calculate dropdown position before showing
		positionDropdown();

		// Toggle dropdown visibility
		dropdown.classList.toggle('active');
	};

	closeDropdownOutside = function (e: MouseEvent) {
		const dropdown = document.getElementById('language-dropdown');
		if (!dropdown) return;

		if (
			!languageButton.contains(e.target as Node) &&
			!dropdown.contains(e.target as Node)
		) {
			dropdown.classList.remove('active');
		}
	};

	// Attach events
	languageButton.addEventListener('click', toggleDropdown);
	document.addEventListener('click', closeDropdownOutside);

	// Only update position on resize if dropdown is active
	window.addEventListener('resize', () => {
		const dropdown = document.getElementById('language-dropdown');
		if (dropdown && dropdown.classList.contains('active')) {
			positionDropdown();
		}
	});
}

// Initialize with proper timing
document.addEventListener('DOMContentLoaded', () => {
	// Check if we need to redirect based on user's language
	redirectToUserLanguage();

	// Setup event handlers
	setupTranslateEvents();
});

// Reinitialize on SPA navigation
document.addEventListener('nav', () => {
	// Update UI instead of recreating everything
	updateLanguageUI();

	// Reset dropdown state
	dropdownCreated = false;
	const existingDropdown = document.getElementById('language-dropdown');
	if (existingDropdown) {
		existingDropdown.remove();
	}

	// Setup events again
	setupTranslateEvents();
});