import { useNavigate, useParams } from 'react-router-dom';
import styles from './ModerationApplication.styles.module.less'
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Preloader, Icon, Button, Table } from 'urfu-ui-kit-react';
import { BackButton } from "~/components/BackButton/BackButton"
import { Card } from '~/components/Card/Card';
import { Info } from "~/components/Info/Info"
import { useGetApplicationByIdQuery } from '~/http/Applications';
import { ArticlesTableColumns } from '~/pages/TableHeader';
import paths from "~/routing/paths"
import { useEditArticleScoreMutation } from '~/http/Articles';
import { useState } from 'react';
import type { Article } from '~/models/application';
import { useNotificationService } from '~/hooks/notificationService';
import { UploadEssay } from '~/components/UploadEssay/UploadEssay';
import { ModalApproval } from './ModalApproval';
import { ModalReturn } from './ModalReturn';
import { getModerationStatuses } from '~/constants/statuses';
import useDebouncedCallback from '~/hooks/useDebouncedCallback';


const ModerationApplication = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { showMessage } = useNotificationService();
  const { data, isLoading } = useGetApplicationByIdQuery(id!);
  const [editScore] = useEditArticleScoreMutation()

  const [inputValues, setInputValues] = useState<Record<string, null | number>>({});
  const [isShowApprovalModal, setIsShowApprovalModal] = useState(false);
  const [isShowReturnModal, setIsShowReturnModal] = useState<{show: boolean, action: 'reject' | 'return' | null}>({show: false, action: null})
  
  const { isApproval, isRejected, isImproved, isReturned } = getModerationStatuses(data?.moderationStatus);
  const isDisabledApprovalButton = data?.articles.some(item => item.score === null);

  const debouncedSave = useDebouncedCallback((scoreName: string, value: number) => {
    handleSaveScore(scoreName, value);
  }, 500);

  const handleInputChange = (id: string, value: number) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: value
    }));
    debouncedSave(id, value)
  };

  const handleSaveScore = async (id: string, value: number) => {
    if (value !== undefined && value !== null) {
      try {
        await editScore({articleId: id, score: value}).unwrap();
        showMessage('Оценка сохранена')
      } catch (error) {
        const err = error as { data?: { message?: string } };
        showMessage(err?.data?.message || 'Ошибка, попробуйте еще раз!', 'fail');
      }
    }
  };


  const columns = [
        ...ArticlesTableColumns,
        {
          field: 'score',
          title: 'Балл',
          width: isApproval || isReturned || isRejected ? 70 : 80,
          render: (rowData: Article) => isApproval || isReturned || isRejected ? <span>{rowData.score}</span> : 
          <div style={{display: 'flex', gap: '10px'}}>
            <input
              className={styles.inputScore}
              type="number"
              min={0}
              value={inputValues[rowData.id] ?? rowData.score ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                if (val === '') {
                  handleInputChange(rowData.id, 0);
                } else {
                  const numberVal = Number(val);
                  if (numberVal >= 0) {
                    handleInputChange(rowData.id, numberVal);
                  }
                }
              }}
            />          
          </div>
        }
      ]

  return (
    isLoading ? <Preloader variant="large-primary" /> :
      <div>
        <BackButton to={paths.moderation.main}>Реестр заявок</BackButton>
        <Card>
          {(isImproved || isReturned) && data?.commentFromModerator && 
            <div className={styles.comment}><Icon name='information' color='#E98446' size='20px'/> {data?.commentFromModerator}</div>
          }
          <Info section='moderation' />
          <div className={styles.scientificActivity}>
            <h4>Научная деятельность</h4>
            <div className={styles.direction}>
              <div className={styles.label}>Направление</div>
              <div className={styles.value}>{data?.direction?.title}</div>
            </div>
            {data?.articles && data.articles.length > 0 && <Table data={data?.articles || []}
              
              columns={columns}
              thStyle={{ fontSize: '12px', padding: '16px 12px 4px', width: 'max-content'}}
              tdStyle={{ fontSize: '12px', padding: '12px', color: '#222222', lineHeight: '140%' }}
            />}
          </div>
          {data && <UploadEssay name={data?.participant?.fullname}/>}
        </Card>
        <Card className={styles.buttonPanel}>
            <div className={styles.buttonContainer}>
              <Button size='small' onClick={() => navigate(paths.moderation.main)} variant="simple">К реестру заявок</Button>
              { !isApproval && !isRejected && <div style={{display: 'flex', gap: '12px'}}>
                <Button onClick={() => setIsShowReturnModal({show: true, action: 'reject'})} size='small' variant="danger">Отклонить</Button>
                {!isReturned && <Button onClick={() => setIsShowReturnModal({show: true, action: 'return'})} size='small' variant="danger-outline">Отправить на доработку</Button>}
                {!isReturned && <Button onClick={() => setIsShowApprovalModal(true)} disabled={isDisabledApprovalButton} size='small' variant="primary">Одобрить заявку</Button>}
              </div>}
            </div>
        </Card>
        {isShowApprovalModal && <ModalApproval applicationId={id!} hideModal={() => setIsShowApprovalModal(false)}/>}
        {isShowReturnModal.show && <ModalReturn applicationId={id!} hideModal={() => setIsShowReturnModal({show: false, action: null})} action={isShowReturnModal.action}/>}
      </div>
  )
}

export default ModerationApplication
