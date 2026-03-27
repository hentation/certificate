import { APPLICATION_STATUSES, STATUS_VARIANTS, type StatusVariant, type Section } from '~/constants/statuses';

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