import { createSelector } from '@reduxjs/toolkit';
import { buildOfferRows, sortBrands } from './model.js';

export const selectQuery = (state) => state.search.query;
export const selectBrandsState = (state) => state.search.brands;
export const selectSelectedBrand = (state) => state.search.selectedBrand;
export const selectOffersState = (state) => state.search.offers;

export const selectSortedBrands = createSelector([(state) => state.search.brands.items], (items) =>
  sortBrands(items),
);

export const selectOfferRows = createSelector(
  [(state) => state.search.offers.requested, (state) => state.search.offers.analogues],
  (requested, analogues) => buildOfferRows({ requested, analogues }),
);
