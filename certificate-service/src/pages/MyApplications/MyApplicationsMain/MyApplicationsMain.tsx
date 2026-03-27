import { Card } from "~/components/Card/Card";
import { Title } from "~/components/Title/Title";
import { Table } from "~/components/Table/Table";
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Message, Preloader, Button, Icon } from "urfu-ui-kit-react";
import styles from "./MyApplicationsMain.styles.module.less";
import { myApplicationsTableColumns } from "./MyApplicationsMainTableColumns";
import { useGetUserApplicationsQuery } from "~/http/user";
import { useGetActualContestQuery } from "~/http/contests";
import type { Application } from "~/models/user";
import { useNavigate, useLocation } from "react-router-dom";
import paths from "~/routing/paths";
import { useNotificationService } from "~/hooks/notificationService";
import { useEffect, useRef, useState } from "react";
import { colors } from "~/styles/colors";
import { humanFormatedDate } from '~/helpers/dateFormat';
import participantInstruction from '~/files/participantInstruction.pdf';

const pdfDocs = [
  // {
  //   name: "Методика расчета баллов",
  //   url: "",
  // },
  // {
  //   name: "Позиции в рейтингах",
  //   url: "",
  // },
  {
    name: "Инструкция участника",
    url: participantInstruction,
  },
];

const MyApplicationsMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMessage } = useNotificationService();
  const errorShownRef = useRef(false);
  const contestErrorShownRef = useRef(false);
  const [showDocs, setShowDocs] = useState(false);

  const { data, isLoading, error, refetch } = useGetUserApplicationsQuery();
  const {
    data: actualContest,
    isLoading: isLoadingContest,
    error: errorContest,
  } = useGetActualContestQuery();

  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  useEffect(() => {
    if (error && !isLoading && !errorShownRef.current) {
      showMessage("Ошибка при загрузке заявок", "fail");
      errorShownRef.current = true;
    }
    if (errorContest && !isLoadingContest && !contestErrorShownRef.current) {
      showMessage("Ошибка при загрузке информации о конкурсе", "fail");
      contestErrorShownRef.current = true;
    }
  }, [error, errorContest, isLoading, isLoadingContest, showMessage]);

  const changedData = data?.map((item, index) => ({
    ...item,
    number: index + 1,
  }));

  const timesUp = actualContest && actualContest.isRegistrationClosed;
  const notOpened = actualContest && actualContest.isRegistrationNotOpened;
  const draftApp =
    actualContest &&
    changedData?.find(
      (e) => e.year === actualContest.year && e.statusTitle === "Черновик"
    );
  const anyApp =
    actualContest && changedData?.find((e) => e.year === actualContest.year);

  const handleClick = () => {
    navigate(paths.myApplications.creating);
  };

  const putRequestButton = () => (
    <Button
      className={styles.putRequestButton}
      icon="plus"
      size="small"
      onClick={handleClick}
    >
      Подать заявку
    </Button>
  );

  const handleShowDocs = () => {
    setShowDocs(true);
  };

  const handleHideDocs = () => {
    setShowDocs(false);
  };

  return (
    <>
      <div className={styles.titleContainerStyle}>
        <Title>Мои заявки</Title>
        <div
          style={{ position: "relative", display: "inline-block" }}
          onMouseEnter={handleShowDocs}
          onMouseLeave={handleHideDocs}
          className="umb24"
        >
          <div
            className={`bt ${styles.documentsStyle}${
              showDocs ? " " + styles["documentsStyle--active"] : ""
            }`}
          >
            Документы
          </div>
          {showDocs && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  height: 8,
                  zIndex: 11,
                }}
                onMouseEnter={handleShowDocs}
                onMouseLeave={handleHideDocs}
              />
              <div
                className={styles.documentsWrapper}
                onMouseEnter={handleShowDocs}
                onMouseLeave={handleHideDocs}
              >
                {pdfDocs.map((doc) => (
                  <div 
                    className={`${styles.documentsItem}`} 
                    key={doc.name}
                    onClick={() => {
                      window.open(doc.url, '_blank');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Icon color={colors.mainDanger} name="pdf" size="40px" />
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bt clr-blue-main"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {doc.name}
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {isLoading || isLoadingContest || error || errorContest ? (
        <Preloader variant="large-primary" />
      ) : (
        actualContest && (
          <Card
            className={
              !isLoading && (changedData && changedData.length > 0 || timesUp || notOpened)
                ? styles.contentEmptyContainerStyle
                : styles.welcomeCard
            }
          >
            {changedData && changedData.length > 0 ? (
              <>
                {notOpened ? (
                  <Message>
                    Подача заявок в текущем году будет открыта с {humanFormatedDate(actualContest.registrationPeriod.beginning, false)}!
                  </Message>
                ) : timesUp ? (
                  <Message>Срок подачи заявок в текущем году истек.</Message>
                ) : actualContest && draftApp ? (
                  <Message>
                    Вы уже приступили к заполнению заявки в текущем году.
                    <br />
                    Подайте заявку до {humanFormatedDate(actualContest.registrationPeriod.ending, false)} включительно!
                  </Message>
                ) : actualContest && anyApp ? (
                  <Message>Вы уже подали заявку в текущем году.</Message>
                ) : null}
                <Table<Application>
                  data={changedData || []}
                  columns={myApplicationsTableColumns}
                />
              </>
            ) : notOpened ? (
              <Message>
                Подача заявок в текущем году будет открыта с {humanFormatedDate(actualContest.registrationPeriod.beginning, false)}!
              </Message>
            ) : timesUp ? (
              <Message>Срок подачи заявок в текущем году истек.</Message>
            ) : (
              <>
                <div className="st">
                  Вы пока не подавали заявку. <br />
                  Успейте подать заявку до <br />
                  <span className="ds clr-blue-main">{humanFormatedDate(actualContest.registrationPeriod.ending, false)}</span>{" "}
                  <span>включительно!</span>
                </div>
                {putRequestButton()}
              </>
            )}
          </Card>
        )
      )}
    </>
  );
};

export default MyApplicationsMain;
