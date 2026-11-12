import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectThemeMode } from './features/theme/themeSlice.js';
import BrandsSection from './components/BrandsSection.jsx';
import Header from './components/Header.jsx';
import OffersSection from './components/OffersSection.jsx';
import SearchForm from './components/SearchForm.jsx';

export default function App() {
  const mode = useSelector(selectThemeMode);

  // Redux хранит выбранную тему, а Bootstrap 5.3 читает её из атрибута data-bs-theme на <html>.
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', mode);
  }, [mode]);

  return (
    <div className="app-container">
      <Header />
      <main>
        <section className="hero">
          <h1 className="hero__title">Подбор запчастей по артикулу</h1>
          <p className="hero__lead">
            Введите номер детали, выберите производителя и сравните аналоги, цены и остатки на
            складах.
          </p>
        </section>
        <SearchForm />
        <BrandsSection />
        <OffersSection />
      </main>
      <footer className="app-footer">
        Тестовое приложение. Данные предоставляет web-сервис «Проценка».
      </footer>
    </div>
  );
}
