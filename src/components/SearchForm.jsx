import { useId, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetSearch } from '../features/search/searchSlice.js';
import { selectBrandsState, selectSelectedBrand } from '../features/search/selectors.js';
import { fetchBrands } from '../features/search/searchThunks.js';
import { CloseIcon, SearchIcon } from './Icons.jsx';
import { Spinner } from './Loader.jsx';
import StepIndicator from './StepIndicator.jsx';

// Артикулы из документации сервиса: по ним демо-ключ возвращает данные.
const EXAMPLES = ['01089', '7160500039S'];

/** Этап 1: ввод артикула. Поиск запускается по кнопке или клавише Enter. */
export default function SearchForm() {
  const dispatch = useDispatch();
  const { status } = useSelector(selectBrandsState);
  const selectedBrand = useSelector(selectSelectedBrand);
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const isLoading = status === 'loading';

  const search = (rawValue) => {
    const number = rawValue.trim();
    if (!number) {
      setValidationError('Введите артикул детали.');
      inputRef.current?.focus();
      return;
    }
    setValidationError('');
    dispatch(fetchBrands(number));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    search(value);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    if (validationError) setValidationError('');
  };

  const handleExample = (example) => {
    setValue(example);
    search(example);
  };

  const handleClear = () => {
    setValue('');
    setValidationError('');
    dispatch(resetSearch());
    inputRef.current?.focus();
  };

  return (
    <section className="plate" aria-label="Поиск по артикулу">
      <form className="plate__form" role="search" onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="visually-hidden">
          Артикул детали
        </label>
        <div className="plate__field">
          <span className="plate__cap" aria-hidden="true">
            <SearchIcon size={22} />
          </span>
          <input
            ref={inputRef}
            id={inputId}
            className="form-control plate__input"
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="Артикул, например 01089"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={64}
            aria-invalid={validationError ? 'true' : undefined}
            aria-describedby={validationError ? errorId : undefined}
          />
          {value && (
            <button
              type="button"
              className="plate__clear"
              onClick={handleClear}
              aria-label="Очистить поиск"
            >
              <CloseIcon size={18} />
            </button>
          )}
        </div>
        <button type="submit" className="btn btn-accent plate__submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner /> Ищем
            </>
          ) : (
            'Найти'
          )}
        </button>
      </form>

      {validationError && (
        <p id={errorId} className="plate__error" role="alert">
          {validationError}
        </p>
      )}

      <div className="examples">
        <span className="examples__label">Например:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="chip"
            onClick={() => handleExample(example)}
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>

      <StepIndicator step={selectedBrand ? 2 : 1} />
    </section>
  );
}
