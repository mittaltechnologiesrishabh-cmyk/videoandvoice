import { useEffect, useState } from "react";

export const useCallNotification = () => {
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === "granted";
    }
    return false;
  };

  const showSimpleNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "/logo.png",
      });
    }
  };

  const showCallNotification = (callerName, callType, onAccept, onReject) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(`Incoming ${callType} call`, {
        body: `${callerName} is calling you...`,
        icon: "/logo.png",
        tag: "incoming-call",
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        onAccept();
        notification.close();
      };
    }
  };

  return {
    notificationPermission,
    requestNotificationPermission,
    showSimpleNotification,
    showCallNotification, 
  };
};
