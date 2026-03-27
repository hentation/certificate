// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Icon } from 'urfu-ui-kit-react';
import styles from './UploadEssay.styles.module.less'
import { useParams } from 'react-router-dom';
import { useLazyGetDownloadEssayByIdQuery } from '~/http/Applications';
import { downloadBlobFile } from '~/helpers/fileHelpers';
import { useNotificationService } from '~/hooks/notificationService';

interface UploadEssayProps {
  name: string;
  section?: 'evaluation' | 'orgCommittee';
  score?: number | undefined | null
}

export const UploadEssay = ({name, section, score}: UploadEssayProps) => {

  const { id } = useParams<{ id: string }>();

  const [trigger, { isFetching }] = useLazyGetDownloadEssayByIdQuery()

  const { showMessage } = useNotificationService();

  const scoreIsNumber = typeof(score) === 'number';

  const handleDownload = async () => {
    if (!id) return
    
    try {
      const result = await trigger(id);

      if(result.isError) {
        showMessage('Ошибка при скачивании файла', 'fail');
        return;
      }
      
      if (result?.data) {
        // Теперь result.data - это Blob, а не строка
        downloadBlobFile(result.data, `Эссе_${name.replace(/\s+/g, "_")}.pdf`)
        showMessage('Файл успешно загружен', 'success');
      } else {
        showMessage('Файл не найден', 'fail');
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      showMessage('Произошла ошибка при загрузке файла', 'fail');
    }
  };

  return (
    <div style={{display: section ? 'flex' : 'block', justifyContent: section ? 'space-between' : 'none'}} className={styles.essayContainer}>
      <div>
        <h4>Эссе</h4>
        <div className={styles.essay}>
          <Icon name='pdf' color='#EF302B' size='35px' />
          <a onClick={isFetching ? undefined : handleDownload} style={{ fontWeight: '600', fontSize: '14px' }} className='u-link'> Эссе_{name.replace(/\s+/g, "_")}.pdf</a>
        </div>
      </div>
      { section && <div className={styles.scoresInfoContainer}>
        <div className={styles.info}>
          <span><b>0 баллов</b> - Не соответствует,</span>
          <span><b>1 балл</b> - Критерий не раскрыт полностью,</span>
          <span><b>2 балла</b> - Нет замечаний</span>
        </div>
        {section === 'evaluation' && <div style={{ backgroundColor: scoreIsNumber ? '#EDF7EB' : '#FCF4E6'}} className={styles.score}>
          <span className={styles.label}>Общий балл</span>
          <span style={{fontSize: scoreIsNumber ? '32px' : '14px', color: scoreIsNumber ? '#147246' : '#e98446'}} className={styles.value}>
            {scoreIsNumber ? score : 'не сформирован, не все эксперты оценили работу'}
          </span>
        </div>}
      </div>}
    </div>
  )
}
