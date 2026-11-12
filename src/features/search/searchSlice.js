import { createSlice } from '@reduxjs/toolkit';
import { ERROR_KIND } from '../../api/errors.js';
import { fetchBrands, fetchOffers } from './searchThunks.js';

/** @typedef {'idle' | 'loading' | 'succeeded' | 'failed'} Status */

const createBrandsState = () => ({ status: 'idle', items: [], error: null, requestId: null });
const createOffersState = () => ({
  status: 'idle',
  requested: null,
  analogues: [],
  error: null,
  requestId: null,
});

const createInitialState = () => ({
  /** Артикул, по которому выполнен последний поиск (не то, что сейчас набрано в поле). */
  query: '',
  brands: createBrandsState(),
  selectedBrand: null,
  offers: createOffersState(),
});

const unknownError = (action) => ({
  kind: ERROR_KIND.UNKNOWN,
  code: null,
  status: null,
  message: action.error?.message ?? 'Unknown error',
});

/*
 * Ответ принимается только если его requestId совпадает с requestId, сохранённым при старте запроса.
 * Так «опоздавший» ответ на прошлый артикул или прошлого производителя не затирает актуальные данные.
 */
const searchSlice = createSlice({
  name: 'search',
  initialState: createInitialState(),
  reducers: {
    resetSearch: () => createInitialState(),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.query = action.meta.arg;
        state.brands = {
          ...createBrandsState(),
          status: 'loading',
          requestId: action.meta.requestId,
        };
        state.selectedBrand = null;
        state.offers = createOffersState();
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (state.brands.requestId !== action.meta.requestId) return;
        state.brands.status = 'succeeded';
        state.brands.items = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (state.brands.requestId !== action.meta.requestId) return;
        state.brands.status = 'failed';
        state.brands.error = action.payload ?? unknownError(action);
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.selectedBrand = action.meta.arg.brand;
        state.offers = {
          ...createOffersState(),
          status: 'loading',
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (state.offers.requestId !== action.meta.requestId) return;
        state.offers.status = 'succeeded';
        state.offers.requested = action.payload.requested;
        state.offers.analogues = action.payload.analogues;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (state.offers.requestId !== action.meta.requestId) return;
        state.offers.status = 'failed';
        state.offers.error = action.payload ?? unknownError(action);
      });
  },
});

export const { resetSearch } = searchSlice.actions;
export default searchSlice.reducer;
