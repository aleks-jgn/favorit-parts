import { createSlice } from '@reduxjs/toolkit';

export const THEME_STORAGE_KEY = 'theme';
const THEMES = ['light', 'dark'];
const DEFAULT_THEME = 'dark';

/**
 * Начальная тема. Её уже выставил inline-скрипт в index.html (сохранённый выбор или тёмная по умолчанию),
 * поэтому читаем результат из атрибута и не дублируем логику.
 */
function detectInitialTheme() {
  if (typeof document !== 'undefined') {
    const applied = document.documentElement.getAttribute('data-bs-theme');
    if (THEMES.includes(applied)) return applied;
  }
  return DEFAULT_THEME;
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