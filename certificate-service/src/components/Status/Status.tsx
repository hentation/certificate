import type { ReactNode } from 'react';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Status as UrFUStatus } from "urfu-ui-kit-react";
import { getStatusVariant } from '~/helpers/statusHelpers';
import type { Section } from '~/constants/statuses';

interface StatusProps {
  children: ReactNode;
  size?: string;
  section: Section;
}

export const Status = ({ children, size = "large", section }: StatusProps) => (
  <UrFUStatus size={size} variant={getStatusVariant(String(children), section)}>{children}</UrFUStatus>
);
