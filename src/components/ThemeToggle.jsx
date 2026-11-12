import { useDispatch, useSelector } from 'react-redux';
import { saveTheme, selectThemeMode, setTheme } from '../features/theme/themeSlice.js';
import { MoonIcon, SunIcon } from './Icons.jsx';

/** Переключатель светлой и тёмной темы. Показывает значок действия: луна в светлой, солнце в тёмной. */
export default function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector(selectThemeMode);
  const next = mode === 'dark' ? 'light' : 'dark';
  const label = next === 'dark' ? 'Включить тёмную тему' : 'Включить светлую тему';

  const handleClick = () => {
    dispatch(setTheme(next));
    saveTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle__icon" data-mode={mode}>
        <SunIcon className="theme-toggle__sun" />
        <MoonIcon className="theme-toggle__moon" />
      </span>
    </button>
  );
}
