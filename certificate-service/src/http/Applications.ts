import type { ApplicationById } from "~/models/application";
import type { OrgCommitteeApplications, OrgCommitteeApplicationsParams, Quantity } from "~/models/orgCommittee";
import { api } from "./api";

const applicatoinsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getApplicationById: builder.query<ApplicationById, string>({
            query: (applicatoinId) => `/applications/${applicatoinId}`,
            providesTags: ['APPLICATION_BY_ID'],
        }),
        getApplicationExperts: builder.query<{
            expert1?: { id: string, fullName: string },
            expert2?: { id: string, fullName: string },
            expert3?: { id: string, fullName: string }
            isEditable?: boolean
        }, string>({
            query: (applicationId) => `/applications/${applicationId}/experts`,
        }),
        setApplicationExperts: builder.mutation<null, { applicationId: string, expert1: string, expert2: string, expert3: string }>({
            query: ({ applicationId, expert1, expert2, expert3 }) => ({
                url: `/applications/${applicationId}/experts`,
                method: 'PUT',
                body: { expert1, expert2, expert3 }
            })
        }),
        getOrgCommittee: builder.query<OrgCommitteeApplications, OrgCommitteeApplicationsParams>({
            query: (params) => {
                const { page, pageSize, ...rest } = params;
                return {
                    url: `/applications`,
                    params: {
                        page,
                        size: pageSize,
                        ...rest
                    }
                };
            },
            providesTags: ['ORG_COMMITTEE_APPLICATIONS']
        }),
        getDownloadEssayById: builder.query<Blob, string>({
            query: (id) => ({
                url: `/applications/${id}/essay/download`,
                method: 'GET',
                responseHandler: async (response) => {
                  return await response.blob();
                },
            }),
        }),
        getQuantities: builder.query<Quantity, void>({
            query: () => ({
                url: `/applications/quantities`,
            }),
            providesTags: ['APPLICATION_QUANTITIES']
        }),
        setIntramuralStage: builder.mutation<null, { applicationId: string, value: boolean }>(
            {
                query: ({ applicationId, value }) => ({
                    url: `/applications/${applicationId}/intramural-stage`,
                    method: 'PUT',
                    body: { isAccepted: value }
                }),
                invalidatesTags: ['ORG_COMMITTEE_APPLICATIONS', 'APPLICATION_QUANTITIES']
            }
        ),
        downloadApplicationsExcel: builder.query<Blob, void>({
            query: () => ({
                url: `/applications/export`,
                method: 'GET',
                responseHandler: async (response: Response) => {
                    if (response.status === 413) {
                        throw new Error('413');
                    }
                    if (!response.ok) {
                        throw new Error('error');
                    }
                    return await response.blob();
                },
            }),
        }),
    })
})
  
export const { useGetApplicationByIdQuery, useGetApplicationExpertsQuery, useSetApplicationExpertsMutation, useGetOrgCommitteeQuery, useGetDownloadEssayByIdQuery, useLazyGetDownloadEssayByIdQuery,useGetQuantitiesQuery, useSetIntramuralStageMutation, useDownloadApplicationsExcelQuery, useLazyDownloadApplicationsExcelQuery } = applicatoinsApi

