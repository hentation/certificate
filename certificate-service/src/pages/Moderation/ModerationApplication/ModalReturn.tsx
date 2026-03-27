// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Modal, Button, Textarea } from 'urfu-ui-kit-react';
import styles from './Modal.styles.module.less'
import { useApplicationActionsMutation } from '~/http/moderation';
import { useNotificationService } from '~/hooks/notificationService';
import { useState } from 'react';

export const ModalReturn = ({ hideModal, applicationId, action }: { hideModal: () => void, applicationId: string, action: 'reject' | 'return' | null }) => {

  const [approvalApplication] = useApplicationActionsMutation();

  const { showMessage } = useNotificationService();

  const [comment, setComment] = useState('');

  const handleApprovalApplication = async () => {
    try {
      if(action) {
        await approvalApplication({ applicationId, action, comment }).unwrap()
        hideModal()
      }
    } catch {
      showMessage('Не удалось!', 'fail')
    }
  }

  return (
    <Modal active={true} onCancel={hideModal}>
      <h3 className={styles.modalTitle}>{action === 'reject' ? 'Отклонить заявку' : 'Отправить заявку на доработку'}</h3>
      <Textarea
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
        className={styles.area}
        placeholder="Введите причину"
        required
        title="Причина отклонения"
        value={comment}
      />
      <div className={styles.modalButtons} >
        <Button onClick={hideModal} variant="simple">Отмена</Button>
        <Button onClick={handleApprovalApplication} variant="primary">Отправить</Button>
      </div>
    </Modal>
  )
}