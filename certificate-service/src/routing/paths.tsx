import { isSubApp } from "~/helpers/baseUtils";
import { PROJECT_NAME } from '~/constants/baseConstants';

const BASE_URL = isSubApp() ? `/${PROJECT_NAME}/` : "/";

const createPath = (subPath: string = "") => `${BASE_URL}${subPath}`;

export default {
  myApplications: {
    main: createPath("my-applications"),
    creating: createPath("my-applications/creating"),
    read: createPath("my-applications/read"),
    // details: (id?: string) => createPath(`my-applications/${id || ':id'}`)
  },
  moderation: {
    main: createPath("moderation"),
    application: createPath("moderation")
  },
  evaluation: {
    main: createPath("evaluation"),
    application: createPath("evaluation")
  },
  orgCommittee: {
    main: createPath("org-committee"),
    application: createPath("org-committee"),
    putExperts: (id?: string) => createPath(`org-committee/put-experts${id ? `/${id}` : ''}`),
    periods: createPath("org-committee/periods"),
  },
  notSection: {
    noAccess: createPath("no-access")
  },
  audition: {
    main: createPath("audition")
  },
  certificates: {
    main:     createPath("certificates"),
    creating: createPath("certificates/creating"),
    edit:     (id?: string) => createPath(`certificates/edit/${id ?? ':id'}`),
    admin:    createPath("admin/certificates"),
  },
  audit: {
    main: createPath("admin/audit"),
  },
} as const;
