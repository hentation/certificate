import { api } from "./api";

const articlesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        editArticleScore: builder.mutation<null, {articleId: string, score: number}>({
            query: ({articleId, score}) => ({
                url: `/articles/${articleId}`,
                method: 'PUT',
                body: {
                    score
                }
            }),
            invalidatesTags: ['APPLICATION_BY_ID']
            
        }),
    }),
})
  
export const { useEditArticleScoreMutation } = articlesApi