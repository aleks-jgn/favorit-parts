import { configureStore } from '@reduxjs/toolkit';
import searchReducer from '../features/search/searchSlice.js';
import themeReducer from '../features/theme/themeSlice.js';

/** Фабрика нужна тестам: у каждого теста собственное хранилище. */
export function createAppStore(preloadedState) {
  return configureStore({
    reducer: { search: searchReducer, theme: themeReducer },
    preloadedState,
  });
}

export const store = createAppStore();
