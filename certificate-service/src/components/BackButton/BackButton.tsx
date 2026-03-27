import { useNavigate } from "react-router-dom";
import styles from "./BackButton.styles.module.less";
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Icon } from "urfu-ui-kit-react";
interface BackButtonProps {
  to: string;
  children: string;
  mb?: number;
}

export const BackButton = ({ to, children, mb }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <>
      {to && children && (
        <div
          className={styles.backButton}
          style={{marginBottom: mb ? mb : 12}}
          onClick={() => navigate(to)}
        >
          <Icon name="left-arrow" color="#1E4391" size="17px" />
          {children}
        </div>
      )}
    </>
  );
};
