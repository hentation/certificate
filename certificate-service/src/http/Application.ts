import type { Agreement, Application, Article, Contacts, Direction, Essay, Secret } from "~/models/application";
import { api } from "./api";

const applicationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getApplication: builder.query<Application, void>({
            query: () => `/application`,
            providesTags: ['APPLICATION']
        }),
        getContacts: builder.query<Contacts, void>({
            query: () => `/application/contacts`,
            providesTags: ['APPLICATION_CONTACTS']
        }),
        getDirection: builder.query<{direction: Direction}, void>({
            query: () => `/application/direction`,
            providesTags: ['APPLICATION_DIRECTION']
        }),
        getArticles: builder.query<Article[], void>({
            query: () => `/application/articles`,
            providesTags: ['APPLICATION_ARTICLES']
        }),
        getArticleById: builder.query<Article, string>({
            query: (id) => `/application/articles/${id}`,
            providesTags: ['APPLICATION_ARTICLES_BY_ID']
        }),
        getEssay: builder.query<Essay, void>({
            query: () => `/application/essay`,
            providesTags: ['APPLICATION_ESSAY']
        }),
        getDownloadEssay: builder.query<string, void>({
            query: () => ({
                url: `/application/essay/download`,
                method: 'GET',
                responseHandler: async (response) => {
                  const blob = await response.blob();
                  return URL.createObjectURL(blob);
                },
              }),
        }),
        editDirection: builder.mutation<null, string>({
            query: (directionId) => ({
                url: `/application/direction`,
                method: 'PUT',
                body: {
                    directionId
                }
            }),
            invalidatesTags: ['APPLICATION_CONTACTS', 'APPLICATION_DIRECTION']
        }),
        editAgreement: builder.mutation<Agreement, boolean>({
            query: (value) => ({
                url: `/application/agreement`,
                method: 'PUT',
                body: {
                    agreement: value
                }
            }),
            invalidatesTags: ['APPLICATION', 'APPLICATION_BY_ID']
        }),
        editSecret: builder.mutation<Secret, boolean>({
            query: (value) => ({
                url: `/application/has-no-state-secrets`,
                method: 'PUT',
                body: {
                   hasNoStateSecrets: value
                }
            }),
            invalidatesTags: ['APPLICATION', 'APPLICATION_BY_ID']
        }),
        editContacts: builder.mutation<null, string>({
            query: (phoneNumber) => ({
                url: `/application/contacts`,
                method: 'PUT',
                body: {
                    phoneNumber
                }
            }),
            invalidatesTags: ['APPLICATION_CONTACTS']
        }),
        editArticle: builder.mutation<null, Article>({
            query: (article) => ({
                url: `/application/articles/${article.id}`,
                method: 'PUT',
                body: {
                    ...article
                }
            }),
            invalidatesTags: ['APPLICATION_ARTICLES_BY_ID', 'APPLICATION_ARTICLES']
        }),
        editEssay: builder.mutation<null, FormData>({
            query: (formData) => ({
                url: `/application/essay`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['APPLICATION_ESSAY']
        }),
        deleteEssay: builder.mutation<null, void>({
            query: () => ({
                url: `/application/essay`,
                method: 'DELETE',
            }),
            invalidatesTags: ['APPLICATION_ESSAY']
        }),
        addArticle: builder.mutation<null, Article>({
            query: (article) => ({
                url: `/application/articles`,
                method: 'POST',
                body: {
                    ...article
                }
            }),
            invalidatesTags: ['APPLICATION_ARTICLES']
        }),
        deleteArticle: builder.mutation<null, string>({
            query: (id) => ({
                url: `/application/articles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['APPLICATION_ARTICLES']
        }),
        sendApplication: builder.mutation<null, void>({
            query: () => ({
                url: `/application/send`,
                method: 'POST',
            }),
            invalidatesTags: ['APPLICATION_BY_ID']
        }),
    }),
})
  
export const { useGetApplicationQuery, useEditContactsMutation, useGetContactsQuery,
            useEditDirectionMutation, useGetDirectionQuery, useGetArticlesQuery,
            useAddArticleMutation, useDeleteArticleMutation, useGetArticleByIdQuery,
            useEditArticleMutation, useGetEssayQuery, useEditEssayMutation,
            useSendApplicationMutation, useEditAgreementMutation, useGetDownloadEssayQuery,
            useDeleteEssayMutation, useEditSecretMutation } = applicationApi