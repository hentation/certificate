import type { Direction } from "~/models/application";
import { api } from "./api";

const directionApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDirections: builder.query<Direction[], void>({
            query: () => `/directions`,
        }),
    }),
})
  
export const { useGetDirectionsQuery } = directionApi