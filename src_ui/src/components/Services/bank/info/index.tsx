import React from 'react';
import prettify from 'utils/prettify';
import Name from './name';
import Item from './item';

type Props = {
  name: string;
  money: number;
  account: string;
};

export default function BankInfo({ name, money, account }: Props) {
  const [firstName, lastName] = name.split('_');

  return (
    <div className='bank_info'>
      <Name
        firstName={firstName}
        lastName={lastName}
      />

      <div className='bank_info-items'>
        <Item
          title='Balans'
          value={prettify.price(money)}
        />
        <Item
          title='Broj računa'
          value={account ? prettify.phoneNumber(account) : 'Nepoznato'}
        />
      </div>
    </div>
  );
}
