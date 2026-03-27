import styles from './Footer.styles.module.less';

export const Footer = () => {
  return (
    <footer className={styles.footerStyles}>
      <div className={styles.columnStyles}>
        <h5>© ФГАОУ ВО «УрФУ имени первого Президента России Б.Н. Ельцина» 2023</h5>
      </div>
      <div className={`${styles.columnStyles} ${styles.columnCenterStyles}`}>
        <h5>Первая линия технической поддержки УрФУ</h5>
        <p className={styles.footerContactStyles}><a className='u-link' href="tel:+73432272070">227-20-70</a> – заявки на обслуживание</p>
      </div>
      <div className={styles.columnStyles}>
        <p className='ds'><a className='u-link' href="mailto: support@urfu.ru">support@urfu.ru</a></p>
      </div>
    </footer>
  );
};
