import { api } from "./api";
import type { ModerationApplications, ModerationApplicationsParams, Status } from "~/models/moderation";

const moderationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getModeration: builder.query<ModerationApplications, ModerationApplicationsParams>({
            query: (params) => {
                const { page, pageSize, ...rest } = params;
                return {
                    url: `/moderation/applications`,
                    params: {
                        page,
                        size: pageSize,
                        ...rest
                    }
                };
            },
            providesTags: ['MODERATION_APPLICATIONS']
        }),
        getModerationStatuses: builder.query<Status[], void>({
            query: () => {
                return {
                    url: `/moderation/statuses`,
                };
            },
            transformResponse: (response: Array<Omit<Status, 'id'> & { id: string | number }>) => {
                return response.map(status => ({
                    ...status,
                    id: String(status.id)
                }));
            }
        }),
        applicationActions: builder.mutation<null, {applicationId: string, action: 'approve' | 'return' | 'reject', comment: string}>({
            query: ({applicationId, action, comment}) => ({
                url: `/moderation/applications/${applicationId}/${action}`,
                method: 'POST',
                body: {
                    comment
                }
            }),
            invalidatesTags: ['APPLICATION_BY_ID', 'MODERATION_APPLICATIONS']
        }),
    }),
})
  
export const { useGetModerationQuery, useGetModerationStatusesQuery, useApplicationActionsMutation } = moderationApi