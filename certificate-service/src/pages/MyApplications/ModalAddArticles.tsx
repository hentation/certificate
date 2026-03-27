/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, Controller } from 'react-hook-form';
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Modal, InputText, Button, Preloader, Select } from 'urfu-ui-kit-react';
import type { Article } from '~/models/application';
import styles from './ModalAddArticles.styles.module.less';
import { useAddArticleMutation, useEditArticleMutation, useGetArticleByIdQuery } from '~/http/Application';
import { useNotificationService } from '~/hooks/notificationService';
import { useEffect } from 'react';
import { useGetActualContestQuery } from '~/http/contests';

interface ModalAddArticlesProps {
  hideModal: () => void;
  activeEditArticle: string | undefined;
}

export const ModalAddArticles = ({hideModal, activeEditArticle}: ModalAddArticlesProps) => {

  const [addArticle, {error: addError, isLoading: addLoading}] = useAddArticleMutation();
  const [editArticle, {error: editError}] = useEditArticleMutation()
  const {data: articleData, isLoading} = useGetArticleByIdQuery(activeEditArticle!, {skip: !activeEditArticle})
  const {data: actual} = useGetActualContestQuery()

  const { showMessage } = useNotificationService();

  const { handleSubmit, reset, control, formState: { errors } } = useForm<Article>({
    defaultValues: {
      articleTitle: '',
      journalTitle: '',
      pubYear: undefined,
      externalId: '',
      category: '',
      link: '',
    },
  });

  useEffect(() => {
    if(articleData) {
      reset(articleData)
    }
  }, [articleData, reset])


  const onSubmit = async (data: Article) => {
    try {
      if(activeEditArticle) {
        await editArticle(data).unwrap()
        showMessage("Статья успешно отредактирована!")
      } else {
        await addArticle(data).unwrap()
        showMessage("Статья успешно добавлена!")
      }
      hideModal()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Modal onCancel={hideModal} active={true}>
      {isLoading ? <Preloader variant="large-primary" /> : 
        <>
          <h3 className={styles.title}>{activeEditArticle ? 'Редактирование публикации' : 'Добавление публикации'}</h3>
          <form className={styles.form}>
            <Controller
              name="articleTitle"
              control={control}
              rules={{ required: 'Введите название публикации' }}
              render={({ field }) => (
                <InputText
                  id="title"
                  title="Название публикации"
                  required
                  placeholder="Введите название"
                  value={field.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                  validationText={errors.articleTitle?.message}
                  validationOn={!!errors.articleTitle}
                />
              )}
            />

            <Controller
              name="journalTitle"
              control={control}
              rules={{ required: 'Введите название журнала' }}
              render={({ field }) => (
                <InputText
                  id="journal"
                  title="Название журнала"
                  required
                  placeholder="Введите название"
                  value={field.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                  validationText={errors.journalTitle?.message}
                  validationOn={!!errors.journalTitle}
                />
              )}
            />

            <div className={styles.flexContainer}>
              {actual && <Controller
                name="pubYear"
                control={control}
                rules={{
                  required: 'Выберите год',
                }}
                render={({ field }) => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Select
                      id="pubYear"
                      title='Год публикации'
                      required
                      {...field}
                      onChange={(option: { label: string; value: number }) => {
                        field.onChange(option.value)
                      }}
                      value={
                        field.value
                          ? { label: String(field.value), value: field.value }
                          : null
                      }
                      options={[
                        { label: actual.year-2 , value: actual?.year-2},
                        { label: actual?.year-1, value: actual?.year-1},
                      ]}
                      validationText={errors.pubYear?.message}
                      validationOn={!!errors.pubYear}
                    />
                  </div>
                )}
              />}

              <Controller
                name="externalId"
                control={control}
                rules={{ required: 'Введите id' }}
                render={({ field }) => (
                  <InputText
                    id="pub-id"
                    title="Scopus id/Wo id"
                    required
                    placeholder="Введите id"
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                    validationText={errors.externalId?.message}
                    validationOn={!!errors.externalId}
                  />
                )}
              />

              <Controller
                name="category"
                control={control}
                rules={{ required: 'Выберите категорию' }}
                render={({ field }) => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Select
                      id="category"
                      title='Категория публикации'
                      required
                      {...field}
                      onChange={(option: { label: string; value: string }) => {
                        field.onChange(option.value);
                      }}
                      value={
                        field.value
                          ? { label: field.value, value: field.value }
                          : null
                      }
                      options={[
                        { label: 'A', value: 'A' },
                        { label: 'B', value: 'B' },
                        { label: 'C', value: 'C' },
                        { label: 'D', value: 'D' },
                        { label: 'E', value: 'E' },
                        { label: 'F', value: 'F' },
                        { label: 'Журнал Nature', value: 'Журнал Nature' },
                        { label: 'Журнал Science', value: 'Журнал Science' },
                      ]}
                      placeholder="Выберите категорию"
                      validationText={errors.category?.message}
                      validationOn={!!errors.category}
                    />
                  </div>
                )}
              />
            </div>

            <Controller
              name="link"
              control={control}
              rules={{
                required: 'Введите ссылку',
                pattern: {
                  value: /^[^\s]+\.[^\s]+$/,
                  message: 'Введите корректную ссылку'
                }
              }}
              render={({ field }) => (
                <InputText
                  id="pure-link"
                  title="Ссылка на Pure"
                  required
                  placeholder="Введите ссылку"
                  value={field.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                  validationText={errors.link?.message}
                  validationOn={!!errors.link}
                />
              )}
            />
            {addError && <p className={styles.error}>{(addError as any)?.data?.message || (addError as any)?.error}</p>}
            {editError && <p className={styles.error}>{(editError as any)?.data?.message || (editError as any)?.error}</p>}
            <div className={styles.buttonContainer}>
              <Button onClick={hideModal} variant="simple">Отмена</Button>
              <Button disabled={addLoading} onClick={handleSubmit(onSubmit)} variant="primary">Сохранить</Button>
            </div>
          </form>
        </>
      }
    </Modal>
  )
}
