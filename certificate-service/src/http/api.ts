import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './config';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  endpoints: () => ({}),
  tagTypes: ['APPLICATION_CONTACTS', 'APPLICATION_DIRECTION', 'APPLICATION_ARTICLES',
             'APPLICATION_ARTICLES_BY_ID', 'APPLICATION_ESSAY', 'APPLICATION',
             'APPLICATION_AGREEMENT', 'APPLICATION_BY_ID', 'MODERATION_APPLICATIONS',
             'EXPRERTISE_SCORES_BY_ID', 'ORG_COMMITTEE_APPLICATIONS', 'EXPERTISE', 'APPLICATION_QUANTITIES', 'CONTESTS',
             'CERTIFICATES', 'CERTIFICATES_ADMIN']
});
