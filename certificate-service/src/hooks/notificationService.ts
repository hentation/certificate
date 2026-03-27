// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { useNotification } from "urfu-ui-kit-react";

export const useNotificationService = () => {
    const { showNotification } = useNotification();
    
    const showMessage = (
      message: string,
      variant: 'success' | 'fail' | 'info' | 'warning' = 'success',
      time: number = 3000,
      options: Record<string, unknown> = {}
    ) => {
      showNotification({
        variant,
        message,
        duration: time,
        top: '20px',
        right: '20px',
        zIndex: '1001',
        ...options
      });
    };
  
    return { showMessage };
  };