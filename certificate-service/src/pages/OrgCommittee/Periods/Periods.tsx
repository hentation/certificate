import React, { useState, useEffect } from 'react';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Button, Modal, InputText, Checkbox, Calendar, Preloader } from 'urfu-ui-kit-react';
import styles from './Periods.styles.module.less';
import { Title } from '~/components/Title/Title';
import { Table } from '~/components/Table/Table';
import { periodsTableColumns } from './PeriodsTableColumns';
import { BackButton } from '~/components/BackButton/BackButton';
import paths from '~/routing/paths';
import { Card } from '~/components/Card/Card';
import { useGetContestQuery, useGetActualContestQuery, useEditContestMutation, useDeleteContestMutation, useCreateContestMutation } from "~/http/contests";
import type { Contest } from '~/models/contest';
import { useNotificationService } from '~/hooks/notificationService';
import { useEditArticleScoreMutation } from '~/http/scores';
import { formatDateForPeriods } from '~/helpers/dateFormat';

export const Periods = () => {
  const {data: contests, isLoading: isLoadingContests, isFetching: isFetchingContests} = useGetContestQuery()
  const {data: actualContest, isLoading: isLoadingActual, isFetching: isFetchingActual} = useGetActualContestQuery()
  const periods = contests?.map(e =>  ({...e, current: actualContest?.year === e.year ? true : false }))

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Contest | null>(null);
  const [form, setForm] = useState({
    year: '',
    startDate: '',
    endDate: '',
    current: true,
  });

  const [editContest] = useEditContestMutation();
  const { showMessage } = useNotificationService();
  const [editArticleScore] = useEditArticleScoreMutation();
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [deleteContest] = useDeleteContestMutation();
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, contest: Contest | null }>({ open: false, contest: null });
  const [createContest] = useCreateContestMutation();
  const [errors, setErrors] = useState<{ year?: string; startDate?: string; endDate?: string }>({});

  useEffect(() => {
    if (editingPeriod) {
      setForm({
        year: editingPeriod.year?.toString() || '',
        startDate: editingPeriod.registrationPeriod?.beginning || '',
        endDate: editingPeriod.registrationPeriod?.ending || '',
        current: !!editingPeriod.current,
      });
    }
  }, [editingPeriod]);

  const handleOpenModal = () => {
    setForm({ year: '', startDate: '', endDate: '', current: true });
    setEditingPeriod(null);
    setIsModalOpen(true);
  };

  const handleEditPeriod = (period: Contest) => {
    setEditingPeriod(period);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPeriod(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'year' ? value.replace(/\D/g, '') : (type === 'checkbox' ? checked : value),
    }));
  };

  const handleSave = async () => {
    // Валидация
    const newErrors: { year?: string; startDate?: string; endDate?: string } = {};
    if (!form.year) newErrors.year = 'Укажите год';
    if (!form.startDate) newErrors.startDate = 'Укажите дату начала';
    if (!form.endDate) newErrors.endDate = 'Укажите дату окончания';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editingPeriod) {
      try {
        await editContest({
          contestId: editingPeriod.id,
          data: {
            year: Number(form.year),
            registrationPeriod: {
              beginning: formatDateForPeriods(form.startDate),
              ending: formatDateForPeriods(form.endDate),
            },
          },
        }).unwrap();
        showMessage('Период успешно сохранён');
        setIsModalOpen(false);
        setEditingPeriod(null);
        setErrors({});
      } catch (error: unknown) {
        let msg = 'Ошибка при сохранении периода';
        if (typeof error === 'object' && error !== null) {
          // @ts-expect-error RTK Query error shape may have data/message
          msg = error.data?.message || error.message || msg;
        }
        showMessage(msg, 'fail');
      }
    } else {
      try {
        await createContest({
          year: Number(form.year),
          registrationPeriod: {
            beginning: formatDateForPeriods(form.startDate),
            ending: formatDateForPeriods(form.endDate),
          },
        }).unwrap();
        showMessage('Период успешно создан', 'success');
        setIsModalOpen(false);
        setEditingPeriod(null);
        setErrors({});
      } catch (error: unknown) {
        let msg = 'Ошибка при создании периода';
        if (typeof error === 'object' && error !== null) {
          // @ts-expect-error RTK Query error shape may have data/message
          msg = error.data?.message || error.message || msg;
        }
        showMessage(msg, 'fail');
      }
    }
  };

  const handleOpenScoreModal = () => setIsScoreModalOpen(true);
  const handleCloseScoreModal = () => setIsScoreModalOpen(false);
  const handleScore = async () => {
    await editArticleScore(undefined);
    showMessage('Баллы рассчитаны', 'success', 4000);
    setIsScoreModalOpen(false);
  };

  const handleOpenDeleteModal = (contest: Contest) => {
    setDeleteModal({ open: true, contest });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ open: false, contest: null });
  };

  const handleDeleteContest = async () => {
    if (!deleteModal.contest) return;
    try {
      await deleteContest({ contestId: deleteModal.contest.id }).unwrap();
      showMessage('Период успешно удалён', 'success');
      handleCloseDeleteModal();
    } catch {
      showMessage('Ошибка при удалении периода', 'fail');
    }
  };

  const isLoading = isLoadingContests || isFetchingContests || isLoadingActual || isFetchingActual;

  return (
    <>
      <BackButton to={paths.orgCommittee.main} mb={24}>Реестр заявок</BackButton>
      <Card>
        <div className={styles.titleWrapper}>
            <h4>Управление периодами подачи заявок</h4>
            <Button size="small" onClick={handleOpenModal} icon="plus" variant="outline">Добавить период</Button>
        </div>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Preloader variant="large-primary" size="48px" />
          </div>
        ) : (
          <Table
            data={periods ? periods.map(period => ({
              ...period,
              onEdit: handleEditPeriod,
              onScore: handleOpenScoreModal,
              onDelete: handleOpenDeleteModal,
            })) : []}
            columns={periodsTableColumns}
            pagination={undefined}
            cellStyle={{fontSize: '14px'}}
          />
        )}
        {isModalOpen && (
          <Modal active={true} onCancel={handleCloseModal}>
            <Title type="h3">{editingPeriod ? 'Редактирование периода' : 'Добавление периода'}</Title>
            <div className={styles.modalInputsForm}>
              <InputText
                name="year"
                title="Год"
                placeholder="Введите год"
                value={form.year}
                onChange={handleChange}
                type="text"
                maxLength={4}
                required
                validationText={errors.year}
                validationOn={!!errors.year}
              />
              <Calendar
                  id="dateBegin"
                  placeholder="Введите дату начала" 
                  title="Дата начала"
                  selected={form.startDate}
                  onChange={(date: string) => setForm(prev => ({ ...prev, startDate: date }))}
                  required
                  validationText={errors.startDate}
                  validationOn={!!errors.startDate}
              />
              <Calendar
                  id="dateEnd"
                  placeholder="Введите дату окончания" 
                  title="Дата окончания"
                  selected={form.endDate}
                  onChange={(date: string) => setForm(prev => ({ ...prev, endDate: date }))}
                  required
                  validationText={errors.endDate}
                  validationOn={!!errors.endDate}
              />
            </div>
            <Checkbox
                name="current"
                checked={form.current}
                onChange={() => setForm(prev => ({ ...prev, current: !prev.current }))}
              >
                Текущий
              </Checkbox>
            <div className={styles.modalButtons}>
              <Button onClick={handleCloseModal} variant="simple">Отмена</Button>
              <Button onClick={handleSave} variant="primary">Сохранить</Button>
            </div>
          </Modal>
        )}
        {isScoreModalOpen && (
          <Modal active={true} onCancel={handleCloseScoreModal}>
            <Title type="h3">Рассчитать баллы</Title>
            <p className='umb42 umt32'>Вы уверены, что хотите запустить расчет баллов за научную деятельность (показатели "Системы стимулирования НПР" и публикации)?</p>
            <div className={styles.modalButtons}>
              <Button onClick={handleCloseScoreModal} variant="simple">Отмена</Button>
              <Button onClick={handleScore} variant="primary">Да</Button>
            </div>
          </Modal>
        )}
        {deleteModal.open && deleteModal.contest && (
          <Modal active={true} onCancel={handleCloseDeleteModal}>
            <Title type="h3">Удалить период</Title>
            <p style={{margin: '24px 0 32px 0'}}>Вы действительно хотите удалить период {deleteModal.contest.year} года?</p>
            <div className={styles.modalButtons}>
              <Button onClick={handleCloseDeleteModal} variant="simple">Нет</Button>
              <Button onClick={handleDeleteContest}>Да</Button>
            </div>
          </Modal>
        )}
      </Card>
    </>
  );
};

export default Periods; 