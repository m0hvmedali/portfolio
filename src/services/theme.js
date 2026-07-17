// Theme Manager (Light/Dark/System)

const THEME_KEY = 'personal-os-theme';
let currentTheme = 'system'; // 'light' | 'dark' | 'system'

const systemMedia = window.matchMedia('(prefers-color-scheme: dark)');

function handleSystemThemeChange(e) {
  if (currentTheme === 'system') {
    applyThemeToDOM(e.matches ? 'dark' : 'light');
  }
}

function applyThemeToDOM(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Dispatch a custom event so other components (like terminal charts or status displays) can update if necessary
  window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme } }));
}

export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
    currentTheme = savedTheme;
  } else {
    currentTheme = 'system';
  }
  
  if (currentTheme === 'system') {
    applyThemeToDOM(systemMedia.matches ? 'dark' : 'light');
  } else {
    applyThemeToDOM(currentTheme);
  }
  
  // Listen for system preference updates
  systemMedia.addEventListener('change', handleSystemThemeChange);
}

export function setTheme(theme) {
  if (theme !== 'light' && theme !== 'dark' && theme !== 'system') return;
  
  currentTheme = theme;
  localStorage.setItem(THEME_KEY, theme);
  
  if (theme === 'system') {
    applyThemeToDOM(systemMedia.matches ? 'dark' : 'light');
  } else {
    applyThemeToDOM(theme);
  }
}

export function getTheme() {
  return currentTheme;
}
