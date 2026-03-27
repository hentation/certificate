import type { User, UserRoles, Application } from "~/models/user";
import { api } from "./api";

const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getUserRoles: builder.query<UserRoles, void>({
            query: () => `/user/roles`,
        }),
        getUserInfo: builder.query<User, void>({
            query: () => `/user/info`,
        }),
        getUserApplications: builder.query<Application[], void>({
            query: () => `/user/applications`,
            keepUnusedDataFor: 0
        }),
    }),
})
  
export const { 
    useGetUserRolesQuery, 
    useGetUserInfoQuery, 
    useGetUserApplicationsQuery,
} = userApi