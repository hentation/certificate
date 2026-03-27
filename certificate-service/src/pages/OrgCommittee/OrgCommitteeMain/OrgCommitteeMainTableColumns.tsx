import { Link } from "react-router-dom";
import { Status } from "~/components/Status/Status";
import paths from "~/routing/paths";
import type { OrgCommitteeApplication } from "~/models/orgCommittee";
import { formatDate } from "~/helpers/dateFormat";
import type { TableColumn } from "~/components/Table/Table.types";
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Checkbox, Icon } from "urfu-ui-kit-react";
import { AppointExpertsButton } from "./AppointExpertsButton";
import styles from './OrgCommitteeMain.styles.module.less';

const STATUSES = {
  UNDER_REVIEW: 'На оценивании',
  ADMITTED_TO_IN_PERSON: 'Допущена к очному этапу',
  NOT_ADMITTED_TO_IN_PERSON: 'Не допущена к очному этапу',
} as const;

type Status = typeof STATUSES[keyof typeof STATUSES];

const ALLOWED_STATUSES: Status[] = [
  STATUSES.UNDER_REVIEW,
  STATUSES.ADMITTED_TO_IN_PERSON,
  STATUSES.NOT_ADMITTED_TO_IN_PERSON,
];

const TOOLTIP_STATUSES: Status[] = [
  STATUSES.ADMITTED_TO_IN_PERSON,
  STATUSES.NOT_ADMITTED_TO_IN_PERSON,
];

export const render = (rowData: OrgCommitteeApplication) => {
  if (!ALLOWED_STATUSES.includes(rowData.status as Status)) {
    return null;
  }

  const status = rowData.status as Status;

  const shouldShowButton =
    ALLOWED_STATUSES.includes(status) &&
    (status === STATUSES.UNDER_REVIEW || rowData.hasExperts);

  const shouldShowTooltip = TOOLTIP_STATUSES.includes(status);

  return shouldShowButton ? (
    <AppointExpertsButton
      id={rowData.id}
      hasExperts={rowData.hasExperts}
      tooltipShow={shouldShowTooltip}
    />
  ) : null;
};

export const getOrgCommitteeMainTableColumns = (
  onCheckboxChange: (id: string, value: boolean) => void,
  completed?: boolean
): TableColumn<OrgCommitteeApplication>[] => [
  {
    title: "№",
    field: "number",
    width: 70,
  },
  {
    title: "ФИО",
    field: "fullName",
    width: 175.5,
    sortOn: true,
    render: (rowData) => (
      <Link to={`${paths.orgCommittee.main}/${rowData.id}`} className="u-link">
        {rowData.fullName}
      </Link>
    ),
    tdContentStyle: {wordBreak: 'break-word'},
  },
  {
    title: "Статус",
    field: "status",
    width: 150,
    sortOn: true,
    render: (rowData) => (
      <Status section="orgCommittee">{rowData.status}</Status>
    ),
  },
  {
    title: "Направление",
    field: "directionTitle",
    width: 175.5,
    sortOn: true,
  },
  {
    title: "Дата подачи заявки",
    field: "sentAt",
    width: 135,
    sortOn: true,
    render: (rowData) => formatDate(rowData.sentAt),
  },
  {
    title: "Балл за «Науч. деят.»",
    field: "scientificalScore",
    width: 151,
    sortOn: true,
    render: (rowData) =>
      rowData.scientificalScore == null ? "-" : rowData.scientificalScore,
    headerIcon: <Icon name="information" size="16px" className={styles.iconInfo}></Icon>,
    headerTooltip: "Суммарный балл по показателям “Системы стимулирования НПР” и научным публикациям"
  },
  {
    title: "Балл за «Эссе»",
    field: "essayScore",
    width: 110,
    sortOn: true,
    render: (rowData) =>
      rowData.essayScore == null ? "-" : rowData.essayScore,
  },
  {
    title: "Итоговый балл",
    field: "finalScore",
    width: 120,
    sortOn: true,
    render: (rowData) =>
      rowData.finalScore == null ? "-" : rowData.finalScore,
  },
  {
    title: "Назначить Экспертов",
    field: "hasExperts",
    width: 120,
    sortOn: true,
    render: (rowData) => render(rowData),
    tdStyle: { textAlign: "center" },
  },
  {
    title: "Допуск в очный этап",
    field: "intramuralStage",
    width: 129,
    sortOn: true,
    render: (rowData) =>
      rowData.finalScore && 
        <Checkbox
          checked={!!rowData.intramuralStage}
          onChange={() =>
            onCheckboxChange(rowData.id, !rowData.intramuralStage)
          }
          disabled={completed}
          style={{ justifyContent: "center" }}
        />
      ,
  },
];