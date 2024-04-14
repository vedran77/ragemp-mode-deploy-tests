import React from 'react';
import rpc from 'utils/rpc';
import { TypeOptions, toast } from 'react-toastify';

import { MdErrorOutline, MdInfoOutline } from 'react-icons/md';
import { IoWarningOutline } from 'react-icons/io5';
import { GrStatusGood } from 'react-icons/gr';

type Notification = 'info' | 'warn' | 'error' | 'success';

const NotificationTitles = {
  info: {
    title: 'Informacija',
    icon: MdInfoOutline,
  },
  warn: {
    title: 'Upozorenje',
    icon: IoWarningOutline,
  },
  error: {
    title: 'Greška',
    icon: MdErrorOutline,
  },
  success: {
    title: 'Uspešno',
    icon: GrStatusGood,
  },
};

rpc.register(
  'Notifications-ShowItem',
  (type: Notification, message: string, inMenu: boolean, delay?: number) => {
    showNotification(type, message, inMenu, delay);
  }
);

const MessageBuild = ({
  status,
  message,
}: {
  status: Notification;
  message: string;
}) => {
  const Icon = NotificationTitles[status].icon;

  return (
    <React.Fragment>
      <Icon className={`icon ${status}`} />

      <div className='content'>
        <p className={`title ${status}`}>{NotificationTitles[status].title}</p>
        <p>{message}</p>
      </div>
    </React.Fragment>
  );
};

export function showNotification(
  type: Notification,
  message: string,
  inMenu = true,
  delay = 2000
) {
  toast.clearWaitingQueue();
  toast.dismiss();

  toast(
    <MessageBuild
      status={type}
      message={message}
    />,
    {
      containerId: inMenu ? 'menu' : 'hud',
      autoClose: delay,
    }
  );
}
