import styles from './Info.styles.module.less'
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Preloader } from 'urfu-ui-kit-react';
import { Status } from '../Status/Status';
import { useParams } from 'react-router-dom';
import { useGetApplicationByIdQuery } from '~/http/Applications';

interface InfoProps {
  section: 'myApplications' | 'moderation' | 'orgCommittee',
  notShowStatus?: boolean
}

export const Info = ({section, notShowStatus}: InfoProps) => {
  const { id } = useParams<{ id: string }>();

  const {data, isLoading} = useGetApplicationByIdQuery(id!)

  const nameParts = data?.participant.fullname.split(' ') || [];
  const [lastName, firstName, middleName] = nameParts;

  return (
    isLoading ? <Preloader variant="large-primary"/> :
    <>
      <div className={styles.header}>
        <h4>Общие сведения</h4>
        {!notShowStatus && <Status section={section}>{section==='moderation' ? data?.moderationStatus : data?.status}</Status>}
      </div>
      <div className={styles.container}>
        <div className={styles.group1}>
          <div className={styles.item}>
            <div className={styles.label}>Фамилия</div>
            <div className={styles.value}>{lastName}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>Имя</div>
            <div className={styles.value}>{firstName}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>Отчество</div>
            <div className={styles.value}>{middleName}</div>
          </div>
          {/* <div className={styles.item}>
            <div className={styles.label}>Контактный телефон</div>
            <div className={styles.value}>{data?.contacts.phoneNumber}</div>
          </div> */}
        </div>

        <div className={styles.group2}>
          <div className={styles.item}>
            <div className={styles.label}>Учёная степень</div>
            <div className={styles.value}>{data?.participant.scientificDegree}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>Занимаемая должность</div>
            <div className={styles.value}>{data?.participant.jobTitle}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>Место работы</div>
            <div className={styles.value}>{data?.participant.divisionTitle}</div>
          </div>
        </div>
      </div>
    </>
  )
}
