import { z } from "zod";
export type Response = {id: string} & Record<string, string | null | undefined>;

export const StringRecord = z.record(z.string(), z.string().or(z.number()).or(z.boolean()));
export type StringRecord = z.infer<typeof StringRecord>;

export type ResponseClean = StringRecord;
export type ResponseRaw = Record<string, unknown>;
