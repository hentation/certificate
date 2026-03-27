// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Modal, Button } from 'urfu-ui-kit-react';
import styles from './Modal.styles.module.less'
import { useNotificationService } from '~/hooks/notificationService';
import { useCompleteContestMutation, useGetActualContestQuery } from '~/http/contests';

export const ModalAllowance = ({ hideModal } : { hideModal: () => void}) => {

  const [completeContest] = useCompleteContestMutation();
  const { data: actualContest } = useGetActualContestQuery();
  const { showMessage } = useNotificationService();

  const handleAllowanceApplication = async () => {
    if (!actualContest?.id) return;
    try {
      await completeContest({ contestId: actualContest.id }).unwrap();
      showMessage('Конкурс завершён', 'success');
      hideModal();
    } catch {
      showMessage('Ошибка завершения конкурса', 'fail');
    }
  }

  return (
    <Modal active={true} onCancel={hideModal}>
      <h3 className={styles.modalTitle}>Допустить к участию в очный этап</h3>
      <p className={styles.modalDescription}>После подтверждения изменить список допущенных в очный этап будет невозможно. Подтвердить действие?</p>
      <div className={styles.modalButtons} >
        <Button onClick={hideModal} variant="simple">Нет</Button>
        <Button onClick={handleAllowanceApplication} variant="primary">Да</Button>
      </div>
    </Modal>
  )
}
