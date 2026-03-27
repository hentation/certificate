import { useNavigate, useParams } from 'react-router-dom';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Preloader, Table, Button, Icon } from 'urfu-ui-kit-react';
import paths from '~/routing/paths';
import { Card } from '~/components/Card/Card';
import { Info } from '~/components/Info/Info';
import styles from './MyApplication.styles.module.less'
import { ArticlesTableColumns } from '../../TableHeader';
import { useGetApplicationByIdQuery } from '~/http/Applications';
import { EditApplication } from '../EditApplication';
import { BackButton } from '~/components/BackButton/BackButton';
import { UploadEssay } from '~/components/UploadEssay/UploadEssay';
import { getMyApplicationStatuses } from '~/helpers/statusHelpers';
import { Results } from '~/components/Results/Results';


const MyApplication = () => {

  const { id } = useParams<{ id: string }>();

  const {data, isLoading} = useGetApplicationByIdQuery(id!)

  const navigate = useNavigate()

  const {
    isDraft,
    isModeration,
    isRejected,
    isOnRevision,
    isOnEvaluation,
    isAllowedOnsite,
    isNotAllowedOnsite
  } = getMyApplicationStatuses(data?.status);

  const dataResults = {
    ssnprScore: data?.ssnprScore,
    articlesScore: data?.articlesScore,
    essayScore: data?.essayScore,
    finalScore: data?.finalScore,
  }

  if(isLoading) {
    return <Preloader variant="large-primary"/>
  }

  if (isModeration || isRejected || isOnEvaluation || isAllowedOnsite || isNotAllowedOnsite) return (
    <div>
        <BackButton to={paths.myApplications.main}>Мои заявки</BackButton>
        <Card>
          <Info section='myApplications' />
          {(isAllowedOnsite || isNotAllowedOnsite) && <Results {...dataResults} section='orgCommittee' />}
          <div className={styles.scientificActivity}>
            <h4>Научная деятельность</h4>
            <div className={styles.direction}>
              <div className={styles.label}>Направление</div>
              <div className={styles.value}>{data?.direction?.title}</div>
            </div>
            {data?.articles && data.articles.length > 0 && <Table data={data?.articles?.map(item => {return {...item, render: () => <a href={item.link}>Ссылка</a>}}) || []}
              className="umt24"
              columns={ArticlesTableColumns}
              thStyle={{fontSize: '12px', padding: '12px', width: 'max-content'}}
              tdStyle={{fontSize: '12px', padding: '12px', color: '#222222', lineHeight: '140%'}}
            />}
          </div>
          {data && <UploadEssay name={data?.participant.fullname}/>}
        </Card>
        <Card className={styles.buttonPanel}>
            <div className={styles.buttonContainer}>
              <Button onClick={() => navigate(paths.myApplications.main)} variant="simple">К моим заявкам</Button>
            </div>
        </Card>
    </div>
  )

  if(isOnRevision || isDraft) return (
    <div>
      <BackButton to={paths.myApplications.main}>Мои заявки</BackButton>
      {data?.status.toLowerCase() === 'на доработке' && data.commentFromModerator && 
          <Card className={styles.commentContainer}>
            <div className={styles.comment}><Icon name='information' color='#E98446' size='20px'/> {data.commentFromModerator}</div>
          </Card>
      }
      {data && <EditApplication application={data}/>}
    </div>
  )
}

export default MyApplication
