import type { Request } from 'express';

export type EmployeeRole = {
    userType: "Employee",
    id: string,
    employmentType: string,
    post: string,
    category: string,
    rate: number,
    divisionId: string,
    divisionTitle: string
}

export type StudentRole = {
    userType: "Student",
    id: string,
    qualification: string,
    instituteTitle: string,
    instituteId: string,
    groupTitle: string,
    groupId: string,
    programId: number,
    course: number,
    compensation: string,
    isForeign: boolean
}

export type ExternalRole = {
    userType: "External",
    id: string,
}

export type UserJwtRole = EmployeeRole | StudentRole | ExternalRole;

export const isStudentRole = (x: UserJwtRole): x is StudentRole =>
    x.userType === "Student";

export const isEmployeeRole = (x: UserJwtRole): x is EmployeeRole =>
    x.userType === "Employee";

export const isExternalRole = (x: UserJwtRole): x is ExternalRole =>
    x.userType === "External";

export type User = {
    person: {
        id: string,
        guid: string,
        title: string,
        lastName: string,
        firstName: string,
        middleName: string,
        email: string
    },
    roles: UserJwtRole[]
}

export type JwtRequest = Request & {user: User}
