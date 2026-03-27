import { api } from "./api";

const articlesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        editArticleScore: builder.mutation({
            query: () => ({
                url: `/scores/process`,
                method: 'POST',
            }),
        }),
    }),
})
  
export const { useEditArticleScoreMutation } = articlesApi