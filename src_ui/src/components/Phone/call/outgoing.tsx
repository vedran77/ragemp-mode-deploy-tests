import React from 'react';
import {
  IoIosMicOff,
  IoIosKeypad,
  IoIosAdd,
  IoIosPeople,
  IoIosCall,
} from 'react-icons/io';
import Info from './info';
import Controls from './controls';

type Props = {
  name: string;
  callTime?: string;
  isRecieveCall: boolean;
  onControlClick: (control: string) => void;
};

const controls = [
  {
    name: 'mic',
    label: 'Mikrofon',
    icon: IoIosMicOff,
  },
  {
    name: 'keypad',
    label: 'Tastatura',
    icon: IoIosKeypad,
  },
  {
    name: 'add',
    label: 'Dodaj',
    icon: IoIosAdd,
  },
  {
    name: 'contacts',
    label: 'Kontakti',
    icon: IoIosPeople,
  },
  {
    name: 'decline',
    label: 'Prekini',
    icon: IoIosCall,
  },
];

export default function OutgoingCall({
  name,
  isRecieveCall,
  onControlClick,
}: Props) {
  return (
    <div className='call_outgoing'>
      <Info
        name={name}
        status={isRecieveCall ? 'Razgovor u toku' : 'Zvoni...'}
      />

      <Controls
        items={controls}
        onClick={onControlClick}
      />
    </div>
  );
}
