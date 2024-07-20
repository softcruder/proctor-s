"use client"
import NotificationComponent from "@/components/NotificationToast";
import { capitalizeTheFirstLetter } from "@/utils";
import { createContext, useState, useCallback, useContext, SetStateAction } from "react";
import { ReactNode } from "react";

type NotificationOptions = {
  type?: string;
  timeOut?: number;
  description?: string | any;
};

type UtilsContextType = {
  notify: (message: string, options?: NotificationOptions) => void;
};

const UtilsContext = createContext<UtilsContextType>({
  notify: (message: string, options?: NotificationOptions | undefined) => {},
});
const timeOutIds: { [key: string]: number } = {};

const UtilsWrapper = ({ children }: { children: ReactNode }) => {
    const [message, setMessage] = useState('');
  const [visibleNotification, setVisibleNotification] = useState(false);
  const [notificationOptions, setNotificationOptions] = useState({});

  const clearExistingTimeouts = () => {
    Object.values(timeOutIds).forEach((time) => {
      clearTimeout(time as number);
    });
  };
  
  const notify = useCallback((message: string, options: NotificationOptions = {}) => {
    try {
      if (options.type === 'danger' && typeof message === 'string') {
        message = message?.replaceAll('_', ' ');
        message = message?.replaceAll('-', ' ');
        message = capitalizeTheFirstLetter(message);
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}

    if (typeof window === undefined) return;
    clearExistingTimeouts();

    setNotificationOptions((prev) => ({ ...prev, ...options }));
    setMessage(message);
    setVisibleNotification(true);

    let timeOutValue = 10_000;
    if (options.timeOut) timeOutValue *= options.timeOut;

    timeOutIds[message] = window.setTimeout(() => {
      setVisibleNotification(false);
      setNotificationOptions({});
    }, timeOutValue);
  }, []);

  const dismissNotification = useCallback(() => {
    setVisibleNotification(false);
    setNotificationOptions({});
  }, []);

  const utilsValues = {
    notify,
  };

  return (
    <UtilsContext.Provider value={utilsValues}>
      <NotificationComponent
        {...notificationOptions}
        visible={visibleNotification}
        message={message}
        dismiss={dismissNotification}
      />
      {children}
    </UtilsContext.Provider>
  )
};

export const useUtilsContext = () => {
    return useContext(UtilsContext);
  };

export default UtilsWrapper;