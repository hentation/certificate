import { api } from "./api";
import type { Contest } from "~/models/contest";

const contestsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getActualContest: builder.query<Contest, void>({
            query: () => `/contests/actual`,
        }),
        getContest: builder.query<Contest[], void>({
            query: () => `/contests`,
            providesTags: ['CONTESTS'],
        }),
        editContest: builder.mutation<null, { contestId: string, data: { year: number, registrationPeriod: { beginning: string, ending: string } } }>({
            query: ({ contestId, data }) => ({
                url: `/contests/${contestId}`,
                method: 'PUT',
                body: {
                    year: data.year,
                    registrationPeriod: data.registrationPeriod
                }
            }),
            invalidatesTags: ['CONTESTS'],
        }),
        completeContest: builder.mutation<null, { contestId: string }>({
            query: ({ contestId }) => ({
                url: `/contests/${contestId}/complete`,
                method: 'POST',
                body: {
                    complete: true
                }
            }),
            invalidatesTags: ['CONTESTS', 'ORG_COMMITTEE_APPLICATIONS'],
        }),
        deleteContest: builder.mutation<null, { contestId: string }>({
            query: ({ contestId }) => ({
                url: `/contests/${contestId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CONTESTS'],
        }),
        createContest: builder.mutation<null, { year: number, registrationPeriod: { beginning: string, ending: string } }>({
            query: (data) => ({
                url: `/contests`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['CONTESTS'],
        }),
    }),
})
  
export const { useGetActualContestQuery, useGetContestQuery, useEditContestMutation, useCompleteContestMutation, useDeleteContestMutation, useCreateContestMutation } = contestsApi