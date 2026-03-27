export type StatusVariant = 'warning' | 'danger' | 'success' | 'neutral' | 'prepared' | 'info' | 'intermediate';

export const STATUS_VARIANTS: Record<Section, Record<string, StatusVariant>> = {
  certificates: {
    NEW:         'info',
    IN_PROGRESS: 'warning',
    ON_REVISION: 'intermediate',
    READY:       'prepared',
    ISSUED:      'success',
    REJECTED:    'danger',
  },
  moderation: {
    NEW: 'info',
    ON_REVISION: 'warning',
    IMPROVED: 'prepared',
    REJECTED: 'danger',
    ACCEPTED: 'success'
  },
  myApplications: {
    DRAFT: 'neutral',
    ON_MODERATION: 'warning',
    ON_REVISION: 'intermediate',
    REJECTED: 'danger',
    ON_EVALUATION: 'prepared',
    ALLOWED_ONSITE: 'success',
    NOT_ALLOWED_ONSITE: 'danger'
  },
  orgCommittee: {
    REJECTED: 'danger',
    ON_REVISION: 'intermediate',
    ON_MODERATION: 'warning',
    ON_EVALUATION: 'prepared',
    ALLOWED_ONSITE: 'success',
    NOT_ALLOWED_ONSITE: 'danger'
  }
} as const;

export const APPLICATION_STATUSES = {
  certificates: {
    NEW:         'новая',
    IN_PROGRESS: 'в работе',
    ON_REVISION: 'на доработке',
    READY:       'готова',
    ISSUED:      'выдана',
    REJECTED:    'отклонена',
  },
  moderation: {
    NEW: 'новая',
    ON_REVISION: 'на доработке',
    IMPROVED: 'доработана',
    REJECTED: 'отклонена',
    ACCEPTED: 'принята'
  },
  myApplications: {
    DRAFT: 'черновик',
    ON_MODERATION: 'на модерации',
    ON_REVISION: 'на доработке',
    REJECTED: 'отклонена',
    ON_EVALUATION: 'на оценивании',
    ALLOWED_ONSITE: 'допущена к очному этапу',
    NOT_ALLOWED_ONSITE: 'не допущена к очному этапу'
  },
  orgCommittee: {
    REJECTED: 'отклонена',
    ON_REVISION: 'на доработке',
    ON_MODERATION: 'на модерации',
    ON_EVALUATION: 'на оценивании',
    ALLOWED_ONSITE: 'допущена к очному этапу',
    NOT_ALLOWED_ONSITE: 'не допущена к очному этапу'
  }
} as const;

export type Section = keyof typeof APPLICATION_STATUSES;

export type ApplicationStatus<T extends Section> = typeof APPLICATION_STATUSES[T][keyof typeof APPLICATION_STATUSES[T]];

// Создаем хелпер для создания проверок статусов
const createStatusChecker = <T extends Section>(section: T) => (status: string | undefined) => (
  targetStatus: keyof typeof APPLICATION_STATUSES[T]
) => isStatus(status, section, targetStatus);

// Хелпер для проверки статуса с учетом раздела
export const isStatus = <T extends Section>(
  status: string | undefined, 
  section: T,
  targetStatus: keyof typeof APPLICATION_STATUSES[T]
): boolean => {
  const sectionStatuses = APPLICATION_STATUSES[section];
  return (status?.toLowerCase() ?? '') === (sectionStatuses[targetStatus] as string).toLowerCase();
};

// Хелпер для получения варианта отображения статуса
export const getStatusVariant = <T extends Section>(
  status: string | undefined,
  section: T
): StatusVariant => {
  if (!status) return 'neutral';
  
  const statusKey = Object.entries(APPLICATION_STATUSES[section]).find(
    ([, value]) => (value as string).toLowerCase() === status.toLowerCase()
  )?.[0] as keyof typeof APPLICATION_STATUSES[T] | undefined;

  return statusKey ? STATUS_VARIANTS[section][statusKey] : 'neutral';
};

// Хелперы для проверки статусов по разделам
export const getModerationStatuses = (status: string | undefined) => {
  const check = createStatusChecker('moderation')(status);
  return {
    isApproval: check('ACCEPTED'),
    isRejected: check('REJECTED'),
    isImproved: check('IMPROVED'),
    isReturned: check('ON_REVISION'),
    isNew: check('NEW')
  };
};

export const getMyApplicationStatuses = (status: string | undefined) => {
  const check = createStatusChecker('myApplications')(status);
  return {
    isDraft: check('DRAFT'),
    isModeration: check('ON_MODERATION'),
    isRejected: check('REJECTED'),
    isOnRevision: check('ON_REVISION'),
    isOnEvaluation: check('ON_EVALUATION'),
    isAllowedOnsite: check('ALLOWED_ONSITE'),
    isNotAllowedOnsite: check('NOT_ALLOWED_ONSITE')
  };
};

export const getOrgCommitteeStatuses = (status: string | undefined) => {
  const check = createStatusChecker('orgCommittee')(status);
  return {
    isRejected: check('REJECTED'),
    isOnRevision: check('ON_REVISION'),
    isOnModeration: check('ON_MODERATION'),
    isOnEvaluation: check('ON_EVALUATION'),
    isAllowedOnsite: check('ALLOWED_ONSITE'),
    isNotAllowedOnsite: check('NOT_ALLOWED_ONSITE')
  };
}; 