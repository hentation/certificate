import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "~/components/BackButton/BackButton";
import { Card } from "~/components/Card/Card";
import paths from "~/routing/paths";
import styles from './ExpertsAppointment.styles.module.less';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Message, Button, Preloader } from 'urfu-ui-kit-react';
import { ExpertField } from './ExpertField';
import { useGetApplicationExpertsQuery, useSetApplicationExpertsMutation } from '~/http/Applications';
import { useNotificationService } from '~/hooks/notificationService';

const ExpertsAppointment = () => {
  const { id: applicationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showMessage } = useNotificationService();

  const { data, isLoading, refetch } = useGetApplicationExpertsQuery(applicationId!);
  const [setExperts, { isLoading: isSaving }] = useSetApplicationExpertsMutation();

  const [experts, setExpertsState] = useState({
    science1: { id: '', fullName: '' },
    science2: { id: '', fullName: '' },
    popular: { id: '', fullName: '' },
    isEditable: true
  });
  const [initialExperts, setInitialExperts] = useState({
    science1: { id: '', fullName: '' },
    science2: { id: '', fullName: '' },
    popular: { id: '', fullName: '' },
  });

  useEffect(() => {
    if (data) {
      const newExperts = {
        science1: data.expert1 ? { id: data.expert1.id, fullName: data.expert1.fullName } : { id: '', fullName: '' },
        science2: data.expert2 ? { id: data.expert2.id, fullName: data.expert2.fullName } : { id: '', fullName: '' },
        popular: data.expert3 ? { id: data.expert3.id, fullName: data.expert3.fullName } : { id: '', fullName: '' },
        isEditable: !!data.isEditable
      };
      setExpertsState(newExperts);
      setInitialExperts(newExperts);
    }
  }, [data]);

  const handleSetExpert = (key: 'science1' | 'science2' | 'popular') => (expert: { id: string, fullName: string }) => {
    setExpertsState(prev => {
      const newState = { ...prev, [key]: expert };
      return newState;
    });
  };

  const allFilled = experts.science1.id && experts.science2.id && experts.popular.id;

  const expertsChanged =
    experts.science1.id !== initialExperts.science1.id ||
    experts.science2.id !== initialExperts.science2.id ||
    experts.popular.id !== initialExperts.popular.id;

  const handleSave = async () => {
    if (!applicationId) return;
    await setExperts({
      applicationId,
      expert1: experts.science1.id,
      expert2: experts.science2.id,
      expert3: experts.popular.id,
    });
    refetch();
    showMessage('Сохранено');
  };

  if (isLoading) return <Preloader variant="large-primary" />;

  return (
    <>
      <BackButton to={paths.orgCommittee.main} mb={24}>Реестр заявок</BackButton>
      <Card className={styles.cardWrapper}>
        <h4>Назначение экспертов</h4>
        {(!allFilled) && (
          <Message variant="warning">Назначьте двух Научных экспертов и одного Эксперта-популяризатора.</Message>
        )}
        <ExpertField
          number={1}
          label="Научный эксперт"
          value={experts.science1.fullName}
          valueId={experts.science1.id}
          onAdd={handleSetExpert('science1')}
          onEdit={handleSetExpert('science1')}
          selectedIds={[experts.science2.id, experts.popular.id].filter(Boolean)}
          isEditable={experts.isEditable}
        />
        <ExpertField
          number={2}
          label="Научный эксперт"
          value={experts.science2.fullName}
          valueId={experts.science2.id}
          onAdd={handleSetExpert('science2')}
          onEdit={handleSetExpert('science2')}
          selectedIds={[experts.science1.id, experts.popular.id].filter(Boolean)}
          isEditable={experts.isEditable}
        />
        <ExpertField
          label="Эксперт-популяризатор"
          value={experts.popular.fullName}
          valueId={experts.popular.id}
          onAdd={handleSetExpert('popular')}
          onEdit={handleSetExpert('popular')}
          selectedIds={[experts.science1.id, experts.science2.id].filter(Boolean)}
          isEditable={experts.isEditable}
        />
        <div className={styles.buttonField}>
          <Button size="small" variant="simple" onClick={() => navigate(paths.orgCommittee.main)}>К реестру заявок</Button>
          <Button disabled={!allFilled || isSaving || !expertsChanged} size="small" onClick={handleSave}>Сохранить</Button>
        </div>
      </Card>
    </>
  )
};

export default ExpertsAppointment;
