import { lazy } from "react";
import paths from "./paths";


const MyApplication = lazy(() => import("../pages/MyApplications/MyApplication/MyApplication"))
const MyApplicationsMain = lazy(() => import("../pages/MyApplications/MyApplicationsMain/MyApplicationsMain"))
const MyApplicationsCreating = lazy(() => import("../pages/MyApplications/MyApplicationsCreating/MyApplicationsCreating"))
// const MyApplicationsDetails = lazy(() => import("../pages/MyApplications/MyApplicationsDetails/MyApplicationsDetails"))

const ModerationMain = lazy(() => import("../pages/Moderation/ModerationMain/ModerationMain"))
const ModerationApplication = lazy(() => import("../pages/Moderation/ModerationApplication/ModerationApplication"))

const EvaluationMain = lazy(() => import("../pages/Evaluation/EvaluationMain/EvaluationMain"))
const EvaluationApplication = lazy(() => import("../pages/Evaluation/EvaluationApplication/EvaluationApplication"))

const OrgCommitteeMain = lazy(() => import("../pages/OrgCommittee/OrgCommitteeMain/OrgCommitteeMain"))
const OrgCommitteeApplication = lazy(() => import("../pages/OrgCommittee/OrgCommitteeApplication/OrgCommitteeApplication"))
const ExpertsAppointment = lazy(() => import("../pages/OrgCommittee/ExpertsAppointment/ExpertsAppointment"))
const Periods = lazy(() => import("../pages/OrgCommittee/Periods/Periods"))

const AuditionMain = lazy(() => import("../pages/Audition/AuditionMain/AuditionMain"))

const NoAccess = lazy(() => import("../pages/NotSection/NoAccess/NoAccess"))

const CertificatesMain     = lazy(() => import("../pages/Certificates/CertificatesMain/CertificatesMain"))
const CertificatesCreating = lazy(() => import("../pages/Certificates/CertificatesCreating/CertificatesCreating"))
const CertificatesEdit     = lazy(() => import("../pages/Certificates/CertificatesEdit/CertificatesEdit"))
const CertificatesAdmin    = lazy(() => import("../pages/Certificates/CertificatesAdmin/CertificatesAdmin"))
const AuditLogs            = lazy(() => import("../pages/AuditLogs/AuditLogs"))

export default {
  myApplications: {
    main: {
      path: paths.myApplications.main,
      Component: MyApplicationsMain,
      requiredRole: 'isParticipant',
    },
    creating: {
      path: paths.myApplications.creating,
      Component: MyApplicationsCreating,
      requiredRole: 'isParticipant',
    },
    read: {
      path: `${paths.myApplications.read}/:id`,
      Component: MyApplication,
      requiredRole: 'isParticipant',
    }
    // details: {
    //   path: paths.myApplications.details(),
    //   Component: MyApplicationsDetails,
    // }
  },
  moderation: {
    main: {
      path: paths.moderation.main,
      Component: ModerationMain,
      requiredRole: 'isModerator',
    },
    application: {
      path: `${paths.moderation.application}/:id`,
      Component: ModerationApplication,
      requiredRole: 'isModerator',
    }
  },
  evaluation: {
    main: {
      path: paths.evaluation.main,
      Component: EvaluationMain,
      requiredRole: 'isExpert',
    },
    application: {
      path: `${paths.evaluation.application}/:id`,
      Component: EvaluationApplication,
      requiredRole: 'isExpert',
    }
  },
  orgCommittee: {
    main: {
      path: paths.orgCommittee.main,
      Component: OrgCommitteeMain,
      requiredRole: 'isOrganizer',
    },
    application: {
      path: `${paths.orgCommittee.application}/:id`,
      Component: OrgCommitteeApplication,
      requiredRole: 'isOrganizer',
    },
    putExperts: {
      path: paths.orgCommittee.putExperts(':id'),
      Component: ExpertsAppointment,
      requiredRole: 'isOrganizer',
    },
    periods: {
      path: paths.orgCommittee.periods,
      Component: Periods,
      requiredRole: 'isOrganizer',
    }
  },
  notSection: {
    noAccess: {
      path: paths.notSection.noAccess,
      Component: NoAccess,
      requiredRole: undefined,
    }
  },
  certificates: {
    main: {
      path: paths.certificates.main,
      Component: CertificatesMain,
      requiredRole: 'isCertificateUser',
    },
    creating: {
      path: paths.certificates.creating,
      Component: CertificatesCreating,
      requiredRole: 'isCertificateUser',
    },
    edit: {
      path: paths.certificates.edit(),
      Component: CertificatesEdit,
      requiredRole: 'isCertificateUser',
    },
    admin: {
      path: paths.certificates.admin,
      Component: CertificatesAdmin,
      requiredRole: 'isModerator',
    },
  },
  audition: {
    main: {
      path: paths.audition.main,
      Component: AuditionMain,
      requiredRole: 'isAuditor',
    }
  },
  audit: {
    main: {
      path: paths.audit.main,
      Component: AuditLogs,
      requiredRole: 'isSystemAdmin',
    }
  },
};
