import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  moderation: {
    search: string;
    direction: string;
    status: string;
  };
  evaluation: {
    search: string;
  };
  orgCommittee: {
    search: string;
    direction: string;
    status: string;
  };
  audition: {
    username: string;
    date: string;
    source: string;
  };
}

const initialState: FiltersState = {
  moderation: {
    search: '',
    direction: '',
    status: ''
  },
  evaluation: {
    search: ''
  },
  orgCommittee: {
    search: '',
    direction: '',
    status: ''
  },
  audition: {
    username: '',
    date: '',
    source: '',
  },
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setModerationSearch: (state, action: PayloadAction<string>) => {
      state.moderation.search = action.payload;
    },
    setModerationDirection: (state, action: PayloadAction<string>) => {
      state.moderation.direction = action.payload;
    },
    setModerationStatus: (state, action: PayloadAction<string>) => {
      state.moderation.status = action.payload;
    },
    setEvaluationSearch: (state, action: PayloadAction<string>) => {
      state.evaluation.search = action.payload;
    },
    setOrgCommitteeSearch: (state, action: PayloadAction<string>) => {
      state.orgCommittee.search = action.payload;
    },
    setOrgCommitteeDirection: (state, action: PayloadAction<string>) => {
      state.orgCommittee.direction = action.payload;
    },
    setOrgCommitteeStatus: (state, action: PayloadAction<string>) => {
      state.orgCommittee.status = action.payload;
    },
    setAuditionSearchUser: (state, action: PayloadAction<string>) => {
      state.audition.username = action.payload;
    },
    setAuditionSearchAction: (state, action: PayloadAction<string>) => {
      state.audition.source = action.payload;
    },
    setAuditionDate: (state, action: PayloadAction<string>) => {
      state.audition.date = action.payload;
    },
    resetModerationFilters: (state) => {
      state.moderation.search = '';
      state.moderation.direction = '';
      state.moderation.status = '';
    },
    resetEvaluationFilters: (state) => {
      state.evaluation.search = '';
    },
    resetOrgCommitteeFilters: (state) => {
      state.orgCommittee.search = '';
      state.orgCommittee.direction = '';
      state.orgCommittee.status = '';
    },
    resetAuditionFilters: (state) => {
      state.audition.date = '';
      state.audition.source = '';
      state.audition.username = '';
    },
  }
});

export const { 
  setModerationSearch, 
  setModerationDirection, 
  setModerationStatus,
  setEvaluationSearch,
  setOrgCommitteeSearch,
  setOrgCommitteeDirection,
  setOrgCommitteeStatus,
  setAuditionSearchAction,
  setAuditionDate,
  setAuditionSearchUser,
  resetAuditionFilters,
  resetModerationFilters,
  resetEvaluationFilters,
  resetOrgCommitteeFilters
} = filtersSlice.actions;

export default filtersSlice.reducer; 