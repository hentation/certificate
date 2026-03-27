import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '~/components/Card/Card'
import paths from '~/routing/paths'
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Icon, Checkbox, Select, Preloader, Button, Message, InputFile, Tooltip, Modal, Table } from 'urfu-ui-kit-react';
import { FormInfo } from '~/components/FormInfo/FormInfo';
import styles from './EditApplication.styles.module.less'
import { useEffect, useState } from 'react';
import { useDeleteArticleMutation, useDeleteEssayMutation, useEditAgreementMutation, useEditDirectionMutation, useEditEssayMutation, useEditSecretMutation, useGetArticlesQuery, useGetDirectionQuery, useGetEssayQuery, useSendApplicationMutation } from '~/http/Application';
import { useGetDirectionsQuery } from '~/http/Direction';
import { useNotificationService } from '~/hooks/notificationService';
import { ArticlesTableColumns } from '../TableHeader.tsx';
import { ModalAddArticles } from './ModalAddArticles';
import type { Application, ApplicationById, Article } from '~/models/application.ts';
import pfdFile from '../../files/essayInfo.pdf'
import { useGetActualContestQuery } from '~/http/contests.ts';



export const EditApplication = ({application}: {application: Application | ApplicationById}) => {

    const {data: selectedDirection} = useGetDirectionQuery();
    const {data: directions, isLoading: isLoadingDirections} = useGetDirectionsQuery();
    const {data: articles, isLoading: isLoadingArticles} = useGetArticlesQuery();
    const {data: essay} = useGetEssayQuery();
    const {data: actual} = useGetActualContestQuery()
    const [changeAgreement] = useEditAgreementMutation()
    const [changeSecret] = useEditSecretMutation()
    const [deleteArticle] = useDeleteArticleMutation()
    const [selectDirection] = useEditDirectionMutation();
    const [uploadEssay] = useEditEssayMutation()
    const [sendApplication] = useSendApplicationMutation();
    const [deleteEssay] = useDeleteEssayMutation()
  
    const { showMessage } = useNotificationService();
  
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    
    const [checkedRules, setChekedRules] = useState(false)
    const [checkedSecret, setCheckedSecret] = useState(false)
    const [currentDirection, setCurrentDirection] = useState<{label: string, value: string}>()
    const [isShowModalArticle, setIsShowModalArticle] = useState(false)
    const [isShowModalSend, setIsShowModalSend] = useState(false)
    const [activeEditArticle, setActiveEditArticle] = useState<string>()

    useEffect(() => {
      if(selectedDirection?.direction) setCurrentDirection({label: selectedDirection.direction.title, value: selectedDirection.direction.id})
    }, [directions, selectedDirection])
  
    useEffect(() => {
      if(application) {
        setChekedRules(application?.agreement)
        setCheckedSecret(application?.hasNoStateSecrets)
      }
    }, [application])
  
  
    const handleSelectDirection = async (option: {label: string, value: string}) => {
      setCurrentDirection(option)
      try {
        await selectDirection(option.value).unwrap()
        showMessage('Направление проводимого исследования успешно сохранено')
      } catch {
        showMessage('Не удалось сохранить направление проводимого исследования', 'fail')
      }
    }
  
    const handleDeleteArticle = async(id: string) => {
      try {
        await deleteArticle(id).unwrap();
        showMessage('Статья успешно удалена')
      } catch {
        showMessage('Не удалось удалить статью', 'fail')
      }
    }
  
    const handleEditArticle = (id: string) => {
      setActiveEditArticle(id);
      setIsShowModalArticle(true)
    }
  
    const handleAddArticle = () => {
      setActiveEditArticle(undefined);
      setIsShowModalArticle(true)
    }
  
    const handleUploadFile = async (files: File[]) => {
      if (!files[0].name.toLowerCase().endsWith('.pdf')) {
        showMessage('Файл должен быть в формате pdf', 'fail');
        return;
      }
      const formData = new FormData();
      formData.append("essay", files[0])
      try {
        await uploadEssay(formData).unwrap()
        showMessage('Эссе успешно загружено!')
      } catch {
        showMessage('Не удалось загрузить Эссе!', 'fail')
      }
    }
  
    const handleChangeAgreement = async() => {
      try {
        const res = await changeAgreement(!checkedRules).unwrap()
        setChekedRules(res.agreement)
        showMessage('Успешно!')
      } catch {
        showMessage('Ошибка, попробуйте еще раз!', 'fail')
      }
    }

    const handleChangeSecret = async() => {
      try {
        const res = await changeSecret(!checkedSecret).unwrap()
        setCheckedSecret(res.hasNoStateSecrets)
        showMessage('Успешно!')
      } catch {
        showMessage('Ошибка, попробуйте еще раз!', 'fail')
      }
    }

    const handleDeleteEssay = async() => {
      try {
        await deleteEssay().unwrap()
        showMessage('Успешно!')
      } catch {
        showMessage('Ошибка, попробуйте еще раз!', 'fail')
      }
    }

    const showChekboxAgreement = !(application && 'status' in application && application.status.toLowerCase() === 'на доработке')
  
    const handleSendApplication = async () => {
      try {
        if(checkedRules && checkedSecret) {
          await sendApplication().unwrap()
          setIsShowModalSend(false)
          if(!id) {
            navigate(paths.myApplications.main);
          }
        } else {
          showMessage('Поставьте галочку в ознакомлении с условиями проведения конкурса!', 'fail')
        }
      } catch {
        showMessage('Не удалось отправить заявку', 'fail')
      }
    }

    // const disabledButtonSendApplicatin = !checkedRules || !essay || !application.contacts.phoneNumber || !currentDirection
    const disabledButtonSendApplicatin = !checkedRules || !essay || !currentDirection || !checkedSecret
  
    const columns = [
      ...ArticlesTableColumns,
      {
        field: 'action',
        title: 'Действия',
        width: 90,
        render: (rowData: Article) => <div style={{display: 'flex', gap: '10px'}}>
          <Tooltip portalOn tooltipText={<div>Изменить</div>}>
            <div onClick={() => handleEditArticle(rowData.id)} style={{display: 'inline-block', cursor: 'pointer'}}>
              <Icon name="pencil" size='20px' color="#1E4391"/>
            </div>
          </Tooltip>
          <Tooltip portalOn tooltipText={<div>Удалить</div>}>
            <div onClick={() => handleDeleteArticle(rowData.id)} style={{display: 'inline-block', cursor: 'pointer'}}>
              <Icon name="cross" size='20px' color="#F58380"/>  
            </div>
          </Tooltip>
        </div>
      }
    ]

  return (
    isLoadingDirections || isLoadingArticles ? <Preloader/> :
    <>
      <Card>
        <FormInfo data={application}/>
      </Card>
      <Card className={styles.scientificActivity}>
        <h4>Научная деятельность</h4>
        <Select
          className={styles.select}
          onChange={handleSelectDirection}
          options={directions?.map(item => {return {label: item.title, value: item.id}})}
          required
          title="Направление проводимого исследования"
          value={currentDirection}
          placeholder="Выберите направление"
        />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Button
            onClick={handleAddArticle}
            variant="outline"
            icon='plus'
            size="small"
            className={styles.buttonAdd}
          >
            Добавить публикацию
          </Button>
          {actual && <div className={styles.publishInfo}>
            Укажите данные о научных публикациях, опубликованных<br/> и проиндексированных в период с <b>01.01.{actual?.year-2}</b> по <b>31.12.{actual?.year-1}</b>
          </div>}
        </div>
        <Table data={articles || []}
          messageForEmptyTable={<p style={{textAlign: 'center'}}>Добавьте публикацию</p>}
          columns={columns}
          thStyle={{ fontSize: '12px', padding: '16px 12px 6px', width: 'max-content'}}
          tdStyle={{ fontSize: '12px', padding: '12px', color: '#222222', lineHeight: '140%' }}
        />
      </Card>
      <Card className={styles.essay}>
        <h4>Эссе</h4>
        <Message>
          <div style={{fontSize: '16px', paddingRight: '14px'}}>
            Напишите эссе на тему: «Наука как призвание: мой путь, мотивация и смыслы» (объем 1–2 страницы,<br/>12 кегль).
            <a href={pfdFile} className={styles.pdfInfo} download="Подробнее об эссе.pdf">Подробнее об эссе</a>
          </div>
        </Message>
        <InputFile
          hideLoaderAfterSelect={1}
          files={essay ? [
            {
              lastModifiedDate: new Date(essay.uploadedAt),
              name: 'Эссе.pdf',
              size: essay.fileSizeInBytes
            }
          ] : []}
          setFiles={essay ? handleDeleteEssay : handleUploadFile}
          title="Прикрепите эссе в формате PDF"
          styleTitle={{color: '#222222'}}
          required
          accept={['pdf']}
          onFileReject={(reason: string) => { showMessage(reason, 'fail') }}
        />
      </Card>
      {showChekboxAgreement && 
      <Card className={styles.agreements}>
        <div className={styles.container}>
          <Checkbox
            checked={checkedRules}
            onChange={handleChangeAgreement}
          >
            <span>Ознакомлен с условиями проведения конкурса<span style={{ color: 'red' }}> *</span></span>
          </Checkbox>
          <Checkbox
            checked={checkedSecret}
            onChange={handleChangeSecret}
            className={styles.checkboxSecret}
          >
            <span><b>Проект не содержит сведений, составляющих государственную и иную охраняемую законом тайну, а также описания товаров и технологий двойного назначения; </b>
            представленные на конкурс сведения являются достоверными<span style={{ color: 'red' }}> *</span></span>
          </Checkbox>
        </div>
      </Card>}
      <Card className={styles.buttonPanel}>
          <div className={styles.buttonContainer}>
            <Button onClick={() => navigate(paths.myApplications.main)} variant="simple">К моим заявкам</Button>
            { !actual?.isRegistrationClosed && <Tooltip tooltipText={<div>Заполните все обязательные поля</div>}>
              <Button disabled={disabledButtonSendApplicatin} onClick={() => setIsShowModalSend(true)}>Отправить заявку</Button>
            </Tooltip> }
          </div>
      </Card>
      {isShowModalArticle && <ModalAddArticles hideModal={() => setIsShowModalArticle(false)} activeEditArticle={activeEditArticle}/>}
      {
        isShowModalSend && <Modal active={true} onCancel={() => setIsShowModalSend(false)}>
            <h3 className={styles.modalSendTitle}>Отправить заявку</h3>
            <p className={styles.modalSendDescription}>Вы действительно хотите отправить заявку? После отправки редактирование будет недоступно.</p>
            <div className={styles.modalSendButtons} >
              <Button onClick={() => setIsShowModalSend(false)} variant="simple">Нет</Button>
              <Button onClick={handleSendApplication} variant="primary">Да</Button>
            </div>
        </Modal>
      }
    </>
  )
}
