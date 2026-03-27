import { colors } from '~/styles/colors';
import styles from './Results.styles.module.less'
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Tooltip, Icon } from 'urfu-ui-kit-react';
import { useGetActualContestQuery } from '~/http/contests';
interface ResultsProps {
  ssnprScore: number | null | undefined,
  articlesScore: number | null | undefined,
  essayScore: number | null | undefined,
  finalScore: number | null | undefined,
  section?: 'myApplication' | 'orgCommittee'
}

export const Results = (data: ResultsProps) => {
  const {data: actual} = useGetActualContestQuery()

  return (
    <>
      <h4 className='umb24 umt24'>{data.section==='myApplication' ? `Результаты оценивания ${actual?.year}` : 'Результаты'}</h4>
      <div className={styles.container}>
        <div className={styles.containerPoints}>
          <div className={styles.containerPoint}><div className={styles.containerWithTooltip}>
            <p className='tt'>Балл по показателям "Системы стимулирования НПР"</p>
            <Tooltip className={styles.tooltip} tooltipText="По итогам 2023-2024 г.">
              <Icon color={colors.mainPrimary} name="information"></Icon>
            </Tooltip></div>
            <div className={`${styles.number} ds clr-blue-main`}>{data.ssnprScore ?? 'не сформирован'}</div>
          </div>
          <div className={styles.containerPoint}>
            <div className='tt'>Балл за научные публикации</div>
            <div className={`${styles.number} ds clr-blue-main`}>{data.articlesScore ?? 'не сформирован'}</div>
          </div>
          <div className={styles.containerPoint}>
            <div className='tt'>Балл за эссе</div>
            <div className={`${styles.number} ds clr-blue-main`}>{data.essayScore ?? 'не сформирован'}</div>
          </div>
        </div>
        <div className={styles.containerTotal}>
          <div className={styles.textContainer}>
            <h4>Итоговый<br/> балл</h4>
            { typeof(data.finalScore)==='number' ? 
            <h2 style={{color: '#147246'}}>{data.finalScore}</h2> :
            <span style={{color: '#147246', fontSize: '16px', fontWeight: '600'}}>не сформирован</span>}
          </div>
        </div>
      </div>
    </>
  )
}
