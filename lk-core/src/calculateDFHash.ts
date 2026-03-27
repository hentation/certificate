import { DescriptionFormat } from "./format/description-format";
import { createHash } from "crypto";

export const calculateDescriptionFormatHash = (df: DescriptionFormat): string =>
    createHash("sha256").update(JSON.stringify(df)).digest("hex").substring(0,16).toUpperCase();