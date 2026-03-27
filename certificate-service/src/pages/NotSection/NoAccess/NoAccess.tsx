import { Card } from "~/components/Card/Card";
import styles from "./NoAccess.styles.module.less";

const NoAccess = () => {
  return (
    <Card className={styles.card}>
      <h4 className="clr-blue-main umb12">Доступ закрыт</h4>
      <div className="ds umb8">
        У вас нет прав для работы с сервисом справок. Обратитесь к администратору.
      </div>
      <span className={styles.bagim} />
      <span className={styles.bagim2} />
      <span className={styles.bagim3} />
    </Card>
  );
};

export default NoAccess;
