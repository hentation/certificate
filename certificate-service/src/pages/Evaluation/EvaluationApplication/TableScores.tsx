import { useParams } from "react-router-dom";
import { useEditExprertiseScoresByIdMutation, useGetExprertiseScoresByIdQuery } from "~/http/expertise";
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Preloader, Table } from 'urfu-ui-kit-react';
import styles from './TableScores.styles.module.less'
import { useState } from "react";
import { useNotificationService } from "~/hooks/notificationService";
import { criteriaForPopularizer, criteriaForScientifical } from "~/constants/criteries";
import useDebouncedCallback from "~/hooks/useDebouncedCallback";

interface DataForScientifical {
  group: string;
  criteries: {
      criteria: string;
      score: {
          name: string;
          data: number | null | undefined;
      };
  }[];
}

interface DataForPopularizer {
  criteria: string;
  score: {
      name: string;
      data: number | null | undefined;
  };
}

export const TableScores = () => {

  const { id } = useParams<{ id: string }>();

  const {data, isLoading} = useGetExprertiseScoresByIdQuery(id!)
  const [editScore] = useEditExprertiseScoresByIdMutation()
  const { showMessage } = useNotificationService();

  const [inputValues, setInputValues] = useState<Record<string, null | number | undefined>>({});

  const debouncedSave = useDebouncedCallback((scoreName: string, value: number) => {
    handleSaveScore(scoreName, value);
  }, 500);
  
  const handleInputChange = (id: string, value: number) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: value
    }));
    debouncedSave(id, value);
  };
  
  const handleSaveScore = async (scoreName: string, value: number) => {
    if (value !== undefined && value !== null && id) {
      try {
        await editScore({ applicationId: id, score: { name: scoreName, data: value } }).unwrap();
        showMessage('Оценка сохранена');
      } catch (error) {
        const err = error as { data?: { message?: string } };
        showMessage(err?.data?.message || 'Ошибка, попробуйте еще раз!', 'fail');
      }
    }
  };



  const tableDataForPopularizer = [
    {
      criteria: criteriaForPopularizer.score1,
          score: {
            name: 'score1',
            data: data?.score1
          }
    },
    {
      criteria: criteriaForPopularizer.score2,
          score: {
            name: 'score2',
            data: data?.score2
          }
    },
    {
      criteria: criteriaForPopularizer.score3,
          score: {
            name: 'score3',
            data: data?.score3
          }
    },
    {
      criteria: criteriaForPopularizer.score4,
          score: {
            name: 'score4',
            data: data?.score4
          }
    }
  ]

  const columnsForPopularizer = [
    {
      field: 'criteria',
      title: 'Критерий',
      render: (rowData: DataForPopularizer) => <div className={styles.criteria}>{rowData.criteria}</div>,
    },
    {
      field: 'score',
      title: 'Балл',
      render: (rowData: DataForPopularizer) => data?.isLocked ? 
        <div className={styles.scoreForPopularizer}>{rowData.score.data}</div> :
        <div>
          <div className={styles.containerInputScoreForPopularizer}>
            <input
              className={styles.inputScore}
              type="number"
              min={0}
              value={inputValues[rowData.score.name] ?? rowData.score.data ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                if (val === '') {
                  handleInputChange(rowData.score.name, 0);
                } else {
                  const numberVal = Number(val);
                  if (numberVal >= 0) {
                    handleInputChange(rowData.score.name, numberVal);
                  }
                }
              }}
            />
          </div>
        </div>
    },
  ]

  const tableDataForScientifical = [
    {
      group: 'Критерии грамотности',
      criteries: [
        {
          criteria: criteriaForScientifical.score1,
          score: {
            name: 'score1',
            data: data?.score1
          }
        },
        {
          criteria: criteriaForScientifical.score2,
          score: {
            name: 'score2',
            data: data?.score2
          }
        },
        {
          criteria: criteriaForScientifical.score3,
          score: {
            name: 'score3',
            data: data?.score3
          }
        }
      ]
    },
    {
      group: 'Критерии научности',
      criteries: [
        {
          criteria: criteriaForScientifical.score4,
          score: {
            name: 'score4',
            data: data?.score4
          }
        },
        {
          criteria: criteriaForScientifical.score5,
          score: {
            name: 'score5',
            data: data?.score5
          }
        },
        {
          criteria: criteriaForScientifical.score6,
          score: {
            name: 'score6',
            data: data?.score6
          }
        },
        {
          criteria: criteriaForScientifical.score7,
          score: {
            name: 'score7',
            data: data?.score7
          }
        },
        {
          criteria: criteriaForScientifical.score8,
          score: {
            name: 'score8',
            data: data?.score8
          }
        }
      ]
    }
  ]

  const columnsForScientifica = [
    {
      field: 'criteria',
      title: 'Критерий',
      render: (rowData: DataForScientifical) => <div className={styles.groupContainer}>
        <div className={styles.group}>{rowData.group}</div>
        <div className={styles.criteries}>
          {rowData.criteries.map((item, index) => <div key={index} className={styles.criteria}>{item.criteria}</div>)}
        </div>
      </div>
    },
    {
      field: 'score',
      title: 'Балл',
      render: (rowData: DataForScientifical) => data?.isLocked ? 
        <div>{rowData.criteries.map((item, index) => <div key={index} className={styles.score}>{item.score.data}</div>)}</div> :
        <div>
          {rowData.criteries.map((item, index) => 
            <div key={index} className={styles.containerInputScore}>
              <input
                className={styles.inputScore}
                type="number"
                min={0}
                value={inputValues[item.score.name] ?? item.score.data ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value;
                  if (val === '') {
                    handleInputChange(item.score.name, 0);
                  } else {
                    const numberVal = Number(val);
                    if (numberVal >= 0) {
                      handleInputChange(item.score.name, numberVal);
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
    },
  ]
  
  return (
    isLoading ? <Preloader variant="large-primary" /> :
    <Table 
      columns={data?.expertType === 'scientifical' ? columnsForScientifica : columnsForPopularizer} 
      data={data?.expertType === 'scientifical' ? tableDataForScientifical : tableDataForPopularizer}
      className={`umt24 ${styles.table}`}
      thStyle={{fontSize: '12px', padding: '12px', width: 'max-content', paddingRight: '0px'}}
    />
  )
}
