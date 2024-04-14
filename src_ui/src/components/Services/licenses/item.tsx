import React from 'react';
import classNames from 'classnames';
import images from 'utils/images';
import prettify from 'utils/prettify';
import PrimaryTitle from 'components/Common/primary-title';
import GradientButton from 'components/Common/gradient-button';

const licenses = {
  house: {
    name: 'Kuća',
    description: 'Dozvoljava kupovinu druge kuće',
  },
  business: {
    name: 'Biznis',
    description: 'Omogućava kupovinu 1 biznisa',
  },
  car: {
    name: 'B Kateogrija',
    description: 'Dozvola za upravljanje vozilom B kategorije',
  },
  motorcycle: {
    name: 'A Kateogrija',
    description: 'Dozvola za upravljanje vozilom A kategorije',
  },
  boat: {
    name: 'Brodske dozvole',
    description: 'Dozvola za upravljanje brodom',
  },
  air: {
    name: 'Dozvola za letenje',
    description: 'Dozvola za upravljanje avionom',
  },
  truck: {
    name: 'C Kateogrija',
    description: 'Dozvola za upravljanje kamionom',
  },
  weapon: {
    name: 'Oružije',
    description: 'Dozvola za nošenje oružija',
  },
  fishing: {
    name: 'Ribolov',
    description: 'Dozvola za ribolov',
  },
};

type Props = {
  name: string;
  price: number;
  bought: boolean;
  buy: () => void;
};

export default function LicensesItem({ name, price, bought, buy }: Props) {
  return (
    <div
      className={classNames('licenses_item', {
        disabled: bought,
      })}
      style={{
        backgroundImage: `${
          bought ? 'linear-gradient(black, black),' : ''
        } url(${images.getImage(`${name}.jpg`, 'licenses')})`,
      }}
    >
      <PrimaryTitle className='licenses_item-title'>Dozvole</PrimaryTitle>
      <h3 className='licenses_item-subtitle'>{(licenses as any)[name].name}</h3>

      {!bought ? (
        <>
          <p className='licenses_item-info'>
            {(licenses as any)[name].description}
          </p>

          <div className='licenses_item-price'>
            <h4>Cena</h4>

            <span>{prettify.price(price)}</span>
          </div>

          <GradientButton
            className='licenses_item-buy'
            onClick={buy}
          >
            Kupi
          </GradientButton>
        </>
      ) : (
        <>
          <span className='licenses_item-checkmark' />
        </>
      )}
    </div>
  );
}
