import { api } from "./api";
import type { Employee } from "~/models/employees";

const employeesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getEmployees: builder.query<Employee[], void>({
            query: () => ({
                url: `/employees`,
            }),
        }),
    }),
})
  
export const { useGetEmployeesQuery } = employeesApi