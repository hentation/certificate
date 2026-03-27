export interface Contest {
  id: string;
  year: number;
  completed: boolean;
  registrationPeriod: { beginning: string, ending: string },
  current: boolean;
  isRegistrationClosed: boolean;
  isRegistrationNotOpened: boolean;
} 