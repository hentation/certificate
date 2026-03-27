export const safeParseJSON = <T>(x: string) => {
    try {
        return {
            value: JSON.parse(x.toString()) as T,
            success: true as const,
        };
    } catch {
        return {
            success: false as const,
        };
    }
}; 