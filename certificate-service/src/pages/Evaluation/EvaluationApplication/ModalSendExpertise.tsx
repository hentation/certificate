// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Modal, Button } from 'urfu-ui-kit-react';
import styles from './ModalSendExpertise.styles.module.less'
import { useSendExprertiseMutation } from '~/http/expertise';
import { useNotificationService } from '~/hooks/notificationService';

export const ModalSendExpertise = ({ hideModal, applicationId }: { hideModal: () => void, applicationId: string }) => {

  const [sendExpertise] = useSendExprertiseMutation()
  const { showMessage } = useNotificationService();


  const handleSendExpertise = async () => {
    try {
      await sendExpertise(applicationId).unwrap()
      hideModal()
    } catch {
      hideModal()
      showMessage('Не удалось завершить оценку!', 'fail')
    }
  }

  return (
    <Modal active={true} onCancel={hideModal}>
      <h3 className={styles.modalSendTitle}>Завершить оценку</h3>
      <p className={styles.modalSendDescription}>Вы действительно хотите завершить оценку? После отправки редактирование будет недоступно.</p>
      <div className={styles.modalSendButtons} >
        <Button onClick={hideModal} variant="simple">Нет</Button>
        <Button onClick={handleSendExpertise} variant="primary">Да</Button>
      </div>
    </Modal>
  )
}
