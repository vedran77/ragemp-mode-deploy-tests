import React from 'react';
import { IoIosAlarm, IoIosText, IoIosCall } from 'react-icons/io';
import Info from './info';
import Controls from './controls';

type Props = {
  name: string;
  onControlClick: (control: string) => void;
};

const controls = [
  {
    name: 'remember',
    label: 'Podsetnik',
    icon: IoIosAlarm,
  },
  {
    name: 'message',
    label: 'Poruka',
    icon: IoIosText,
  },
  {
    name: 'decline',
    label: 'Prekini',
    icon: IoIosCall,
  },
  {
    name: 'accept',
    label: 'Prihvati',
    icon: IoIosCall,
  },
];

export default function IncomingCall({ name, onControlClick }: Props) {
  return (
    <div className='call_incoming'>
      <Info
        status='Poziv'
        name={name}
      />

      <Controls
        items={controls}
        onClick={onControlClick}
      />
    </div>
  );
}
