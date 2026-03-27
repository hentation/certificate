import paths from "~/routing/paths";
import { BackButton } from "~/components/BackButton/BackButton";
import { Card } from "~/components/Card/Card";
import { Info } from "~/components/Info/Info";
import { Results } from "~/components/Results/Results";
import styles from './OrgCommitteeApplication.styles.module.less'
import { useGetApplicationByIdQuery, useGetApplicationExpertsQuery, useSetIntramuralStageMutation } from "~/http/Applications";
import { useNavigate, useParams } from "react-router-dom";
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Preloader, Table, Button, Modal, Icon, Tooltip } from 'urfu-ui-kit-react';
import { UploadEssay } from "~/components/UploadEssay/UploadEssay";
import { criteriaForPopularizer, criteriaForScientifical } from "~/constants/criteries";
import { useState } from "react";
import { useNotificationService } from "~/hooks/notificationService";
import { getOrgCommitteeStatuses } from "~/constants/statuses";

interface TableData {
  criteria: string,
  expert1: string | number,
  expert2: string | number,
  expert3: string | number
}

const OrgCommitteeApplication = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()

  const {data, isLoading} = useGetApplicationByIdQuery(id!);
  const {data: experts} = useGetApplicationExpertsQuery(id!);
  const [sendApplication] = useSetIntramuralStageMutation()

  const { showMessage } = useNotificationService();

  const [isShowModal, setIsShowModal] = useState(false)

  const {
    isAllowedOnsite,
    isNotAllowedOnsite
  } = getOrgCommitteeStatuses(data?.status);

  const handleSendApplication = async() => {
    if(id) {
      try {
        await sendApplication({value: true, applicationId: id}).unwrap()
        navigate(paths.orgCommittee.main)
      } catch {
        setIsShowModal(false)
        showMessage('Не удалось завершить оценку!', 'fail')
      }
    }
  }

  const results = {
    ssnprScore: data?.ssnprScore,
    articlesScore: data?.articlesScore,
    essayScore: data?.essayScore,
    finalScore: data?.finalScore
  }

  const scientificActivity = () => {
    return (
      <div className={styles.scientificActivity}>
          <h4>Научная деятельность</h4>
          <div className={styles.direction}>
            <div className="tt clr-gray-60">Направление</div>
            <div className="th clr-black-main">{data?.direction?.title}</div>
          </div>
        </div>
    )
  }

  const tableData = [
    ...Object.entries(criteriaForScientifical).map(item => {
      return {
        criteria: item[1],
        expert1: data?.essayScoringDetails.expert1[item[0]] ?? 'нет оценки',
        expert2: data?.essayScoringDetails.expert2[item[0]] ?? 'нет оценки',
        expert3: '-'
      }
    }),
    ...Object.entries(criteriaForPopularizer).map(item => {
      return {
        criteria: item[1],
        expert1: '-',
        expert2: '-',
        expert3: data?.essayScoringDetails.expert3[item[0]] ?? 'нет оценки'
      }
    })
  ]

  const columns = [
    {
      field: 'criteria',
      title: 'Критерий'
    },
    {
      field: 'expert1',
      title: <Tooltip portalOn tooltipText={experts?.expert1?.fullName || 'Не назначен'}>
        <div className={styles.thContainer}><span>Научный эксперт 1</span><Icon className={styles.thIcon} color='#1E4391' size='14px' name='information'/></div>
      </Tooltip>,
      render: (rowData: TableData) => 
        <div
          className={styles.score} 
          style={{backgroundColor: rowData.expert1 === 'нет оценки' ? '#FDEAEA' : '#fff'}}>
            {rowData.expert1}
        </div>
    },
    {
      field: 'expert2',
      title: <Tooltip portalOn tooltipText={experts?.expert2?.fullName || 'Не назначен'}>
          <div className={styles.thContainer}><span>Научный эксперт 2</span><Icon className={styles.thIcon} color='#1E4391' size='14px' name='information'/></div>
        </Tooltip>,
      render: (rowData: TableData) => 
        <div
          className={styles.score} 
          style={{backgroundColor: rowData.expert2 === 'нет оценки' ? '#FDEAEA' : '#fff'}}>
            {rowData.expert2}
        </div>
    },
    {
      field: 'expert3',
      title: <Tooltip portalOn tooltipText={experts?.expert3?.fullName || 'Не назначен'}>
          <div className={styles.thContainer}><span>Эксперт-популяризатор</span><Icon className={styles.thIcon} color='#1E4391' size='14px' name='information'/></div>
        </Tooltip>,
      render: (rowData: TableData) => 
        <div
          className={styles.score}
          style={{backgroundColor: rowData.expert3 === 'нет оценки' ? '#FDEAEA' : '#fff'}}>
            {rowData.expert3}
        </div>
    },
  ]

  const criteriasTable = () => {
    return (
      <Table
        data={tableData}
        columns={columns}
        className={`umt24 ${styles.table}`}
        thStyle={{fontSize: '12px', padding: '12px', width: 'max-content', paddingRight: '0px'}}
      />
    )
  }

  return (
    isLoading ? <Preloader variant="large-primary" /> :
    <>
      <BackButton mb={24} to={paths.orgCommittee.main}>
        Реестр заявок
      </BackButton>
      <Card>
        <Info section="orgCommittee" />
        <Results {...results} />
        {scientificActivity()}
        {data && <UploadEssay name={data?.participant.fullname} section='orgCommittee' />}
        {criteriasTable()}
      </Card>
      <Card className={styles.buttonPanel}>
        <div className={styles.buttonContainer}>
          <Button size='small' onClick={() => navigate(paths.orgCommittee.main)} variant="simple">К реестру заявок</Button>
          {!(isAllowedOnsite || isNotAllowedOnsite) && <Button size='small' disabled={!data?.finalScore} onClick={() => setIsShowModal(true)} variant="primary">Выбрать к очному этапу</Button>}
        </div>
      </Card>
      {isShowModal && <Modal active={true} onCancel={() => setIsShowModal(false)}>
        <h3 className={styles.modalSendTitle}>Выбрать к очному этапу</h3>
        <p className={styles.modalSendDescription}>После подтверждения изменить список допущенных в очный этап будет невозможно. Подтвердить действие?</p>
        <div className={styles.modalSendButtons} >
          <Button onClick={() => setIsShowModal(false)} variant="simple">Нет</Button>
          <Button onClick={handleSendApplication} variant="primary">Да</Button>
        </div>
      </Modal>}
    </>
  );
};

export default OrgCommitteeApplication;
