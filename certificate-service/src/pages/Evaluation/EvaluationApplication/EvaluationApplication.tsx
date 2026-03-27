import { useNavigate, useParams } from "react-router-dom";
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Preloader, Button } from 'urfu-ui-kit-react';
import { BackButton } from "~/components/BackButton/BackButton";
import { Card } from "~/components/Card/Card";
import { Info } from "~/components/Info/Info";
import { useGetApplicationByIdQuery } from "~/http/Applications";
import paths from "~/routing/paths";
import styles from './EvaluationApplication.styles.module.less'
import { UploadEssay } from "~/components/UploadEssay/UploadEssay";
import { TableScores } from "./TableScores";
import { ModalSendExpertise } from "./ModalSendExpertise";
import { useState } from "react";
import { useGetExprertiseScoresByIdQuery } from "~/http/expertise";

const EvaluationApplication = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()

  const { data, isLoading } = useGetApplicationByIdQuery(id!);
    const {data: dataTable, isLoading: isTableLoading} = useGetExprertiseScoresByIdQuery(id!)
  const [isShowModal, setIsShowModal] = useState(false)

  const isDisabledButton = () => {
    if(dataTable) {
      return Object.entries(dataTable).some(([key, val]) => key.startsWith('score') && val === null);
    }
    return false;
  }
  
  return (
    isLoading || isTableLoading ? <Preloader variant="large-primary" /> :
    <div>
      <BackButton to={paths.evaluation.main}>Реестр заявок</BackButton>
      <Card>
        <Info section='moderation' notShowStatus={true}/>
        <div className={styles.scientificActivity}>
          <h4>Научная деятельность</h4>
          <div className={styles.direction}>
            <div className={styles.label}>Направление</div>
            <div className={styles.value}>{data?.direction?.title}</div>
          </div>
          <div className={styles.scoresContainer}>
            <div className={styles.scoresPanel1}>
              <span className={styles.label}>Балл по показателям "Системы стимулирования НПР"</span>
              <span className={styles.value}>{data?.ssnprScore || '—'}</span>
            </div>
            <div className={styles.scoresPanel2}>
              <span className={styles.label}>Балл за научные публикации</span>
              <span className={styles.value}>{data?.articlesScore || '—'}</span>
            </div>
          </div>
        </div>
        {data && <UploadEssay name={data?.participant.fullname} section='evaluation' score={data.essayScore}/>}
        <TableScores/>
      </Card>
      <Card className={styles.buttonPanel}>
          <div className={styles.buttonContainer}>
            <Button size='small' onClick={() => navigate(paths.evaluation.main)} variant="simple">К реестру заявок</Button>
            {!dataTable?.isLocked && <Button disabled={isDisabledButton()} size='small' onClick={() => setIsShowModal(true)} variant="primary">Завершить оценку</Button>}
          </div>
      </Card>
      {isShowModal && <ModalSendExpertise hideModal={() => setIsShowModal(false)} applicationId={id!}/>}
    </div>
  )
}

export default EvaluationApplication