import { createAsyncThunk } from '@reduxjs/toolkit';
import { searchBrands, searchOffers } from '../../api/favoritApi.js';
import { toSerializableError } from '../../api/errors.js';

/** Этап 1: производители по артикулу. */
export const fetchBrands = createAsyncThunk(
  'search/fetchBrands',
  async (number, { signal, rejectWithValue }) => {
    try {
      return await searchBrands(number, { signal });
    } catch (error) {
      return rejectWithValue(toSerializableError(error));
    }
  },
  {
    // Повторный клик по «Найти» во время загрузки того же артикула не должен дублировать запрос.
    condition: (number, { getState }) => {
      const { brands, query } = getState().search;
      return !(brands.status === 'loading' && query === number);
    },
  },
);

/** Этап 2: искомая позиция и аналоги выбранного производителя. */
export const fetchOffers = createAsyncThunk(
  'search/fetchOffers',
  async ({ number, brand }, { signal, rejectWithValue }) => {
    try {
      return await searchOffers({ number, brand }, { signal });
    } catch (error) {
      return rejectWithValue(toSerializableError(error));
    }
  },
  {
    // Квота API ограничена, поэтому не запрашиваем повторно то, что уже загружено или грузится.
    condition: ({ brand }, { getState }) => {
      const { selectedBrand, offers } = getState().search;
      const isSameBrand = selectedBrand === brand;
      return !(isSameBrand && (offers.status === 'loading' || offers.status === 'succeeded'));
    },
  },
);
