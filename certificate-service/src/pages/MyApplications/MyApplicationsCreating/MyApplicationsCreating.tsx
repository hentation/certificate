import { useNavigate } from 'react-router-dom'
import { Title } from '~/components/Title/Title'
import paths from '~/routing/paths'
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Preloader } from 'urfu-ui-kit-react';
import { useEffect } from 'react';
import { useGetUserApplicationsQuery } from '~/http/user';
import { useGetActualContestQuery } from '~/http/contests';
import { EditApplication } from '../EditApplication.tsx';
import { useGetApplicationQuery } from '~/http/Application.ts';
import { BackButton } from '~/components/BackButton/BackButton';

const MyApplicationsCreating = () => {

  const {data: applications, isLoading} = useGetUserApplicationsQuery();
  const {data: actualContest} = useGetActualContestQuery();
  const {data: application} = useGetApplicationQuery()

  const navigate = useNavigate()

  useEffect(() => {
    if (applications && actualContest && applications.some(app => app.year === actualContest.year)) {
      navigate(paths.myApplications.main);
    }
  }, [applications, actualContest, navigate]);

  // Если данные загружаются или есть существующая заявка, показываем прелоадер
  if ((applications && actualContest && applications.some(app => app.year === actualContest.year))) {
    return <Preloader variant="large-primary" />;
  }

  return (
    isLoading ? <Preloader/> :
    <div style={{position: 'relative'}}>
        <BackButton to={paths.myApplications.main}>Мои заявки</BackButton>
        <Title>Подача заявки</Title>
        <EditApplication application={application!}/>
    </div>
  )
}

export default MyApplicationsCreating