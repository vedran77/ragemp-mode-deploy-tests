import React from 'react';
import moment from 'moment-timezone';

const actions: { [name: string]: string } = {
  ban: 'Ban',
  unban: 'Unban',
  kick: 'Kick',
  demorgan: 'Zatvor',
  prison_release: 'Oslobodi',
  house_add: 'Kreiraj Kuću',
  house_delete: 'Uništi Kuću',
  vehicle_create: 'Stvori Vozilo',
  money: 'Novac',
  skin: 'Skin',
  notify: 'Obavestenje',
};

type Props = {
  admin: string;
  action: string;
  message: string;
  time: string;
};

export default function AdminReportsItem({
  admin,
  action,
  message,
  time,
}: Props) {
  return (
    <div className='admin_reports-item'>
      <span className='admin_reports-sender'>{admin}</span>
      <p className='admin_reports-message'>{message}</p>

      <span className='admin_reports-time'>
        <strong>{actions[action]} | </strong>{' '}
        {moment(time).format('DD.MM.YY, HH:mm')}
      </span>
    </div>
  );
}
