export interface AuditionApplication {
    number: number,
    id: number,
    createdAt: string,
    level: number,
    source: string,
    message: string,
    ipAddress: string,
    username: string,
    parameters: {
        applicationId?: string
    },
}

export interface Logs {
    total: number,
    items: AuditionApplication[]
}

export interface LogsParams {
    page: number;
    pageSize: number;
}