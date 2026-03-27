// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Modal, Button } from 'urfu-ui-kit-react';
import styles from './Modal.styles.module.less'
import { useApplicationActionsMutation } from '~/http/moderation';
import { useNotificationService } from '~/hooks/notificationService';

export const ModalApproval = ({ hideModal, applicationId } : { hideModal: () => void, applicationId: string}) => {

  const [approvalApplication] = useApplicationActionsMutation();

  const { showMessage } = useNotificationService();

  const handleApprovalApplication = async () => {
    try {
      await approvalApplication({applicationId, action: 'approve', comment: ''}).unwrap()
      hideModal()
    } catch {
      showMessage('Не удалось одобрить заявку!', 'fail')
    }
  }

  return (
    <Modal active={true} onCancel={hideModal}>
      <h3 className={styles.modalTitle}>Одобрить заявку</h3>
      <p className={styles.modalDescription}>Вы действительно хотите одобрить заявку? После нажатия «одобрить» редактирование заявки будет недоступно.</p>
      <div className={styles.modalButtons} >
        <Button onClick={hideModal} variant="simple">Нет</Button>
        <Button onClick={handleApprovalApplication} variant="primary">Да</Button>
      </div>
    </Modal>
  )
}
