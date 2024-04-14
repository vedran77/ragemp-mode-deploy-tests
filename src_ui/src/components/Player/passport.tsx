import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import rpc from 'utils/rpc';

const fields = {
  firstName: 'Ime',
  lastName: 'Preyime',
  gender: 'Pol',
  registerAt: 'Datum Registracije',
};

type Props = {} & RouteComponentProps<
  {},
  {},
  { [name in keyof typeof fields]: string }
>;

export default function PlayerPassport({ location }: Props) {
  const player = location.state || {
    firstName: 'N/A',
    lastName: 'N/A',
    gender: 'N/A',
    registerAt: 'N/A',
  };

  return (
    <div className='player-passport'>
      <div className='player-passport_container'>
        <span
          className='faction-docs_close'
          onClick={() => rpc.callClient('Browser-HidePage')}
        >
          <IoClose />
        </span>

        <ul className='player-passport_fields'>
          {Object.entries(fields).map(([name, title]) => (
            <li
              key={name}
              className='player-passport_field'
            >
              <h4 className='player-passport_field-name'>{title}:</h4>

              <span className='player-passport_field-value'>
                {(player as any)[name]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
