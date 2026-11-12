import { createSlice } from '@reduxjs/toolkit';

export const THEME_STORAGE_KEY = 'theme';
const THEMES = ['light', 'dark'];

/**
 * Начальная тема. Её уже выставил inline-скрипт в index.html (сохранённый выбор или системная схема),
 * поэтому читаем результат из атрибута и не дублируем логику. Системная схема нужна как запасной вариант.
 */
function detectInitialTheme() {
  if (typeof document !== 'undefined') {
    const applied = document.documentElement.getAttribute('data-bs-theme');
    if (THEMES.includes(applied)) return applied;
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/** Выбор пользователя запоминаем только после явного переключения. */
export function saveTheme(mode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* localStorage может быть недоступен (приватный режим): тема просто не запомнится */
  }
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: detectInitialTheme() },
  reducers: {
    setTheme(state, action) {
      if (THEMES.includes(action.payload)) state.mode = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export const selectThemeMode = (state) => state.theme.mode;
export default themeSlice.reducer;
