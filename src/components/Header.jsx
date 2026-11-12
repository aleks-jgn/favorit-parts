import { LogoIcon } from './Icons.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  return (
    <header className="app-header">
      <span className="brandmark">
        <LogoIcon size={26} className="brandmark__icon" />
        <span className="brandmark__name">Подбор запчастей</span>
      </span>
      <ThemeToggle />
    </header>
  );
}
