import { api } from "./api";
import type { ExpertiseApplications, ExpertiseApplicationsParams, ExpertiseScores } from "~/models/expertise";

const expertiseApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getExpertise: builder.query<ExpertiseApplications, ExpertiseApplicationsParams>({
            query: (params) => {
                const { page, pageSize, ...rest } = params;
                return {
                    url: `/expertise/applications`,
                    params: {
                        page,
                        size: pageSize,
                        ...rest
                    }
                };
            },
            providesTags: ['EXPERTISE']
        }),
        getExprertiseScoresById: builder.query<ExpertiseScores, string>({
            query: (id) => `/expertise/applications/${id}/scores`,
            providesTags: ['EXPRERTISE_SCORES_BY_ID']
        }),
        editExprertiseScoresById: builder.mutation<null, {applicationId: string, score: {name: string, data: number}}>({
            query: ({applicationId, score}) => ({
                url: `/expertise/applications/${applicationId}/scores`,
                method: 'PATCH',
                body: {
                    [score.name]: score.data
                }
            }),
            invalidatesTags: ['EXPRERTISE_SCORES_BY_ID'] 
        }),
        sendExprertise: builder.mutation<null, string>({
            query: (applicationId) => ({
                url: `/expertise/applications/${applicationId}/scores/finalize`,
                method: 'POST',
            }),
            invalidatesTags: ['EXPRERTISE_SCORES_BY_ID', 'APPLICATION_BY_ID', 'EXPERTISE'] 
        }),
    }),
})
  
export const { useGetExpertiseQuery, useGetExprertiseScoresByIdQuery, useEditExprertiseScoresByIdMutation, useSendExprertiseMutation } = expertiseApi