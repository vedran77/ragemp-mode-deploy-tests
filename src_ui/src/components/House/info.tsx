import React from 'react';
import prettify from 'utils/prettify';
import PrimaryTitle from 'components/Common/primary-title';

type Props = {
  isOwner: boolean;
  owner: string;
  tax: number;
  price: number;
  paid: number;
};

export default function HouseInfo({ isOwner, owner, tax, price, paid }: Props) {
  return (
    <div className='house_info'>
      <PrimaryTitle>Informacije</PrimaryTitle>

      <div className='house_info-container'>
        <div className='house_info-item'>
          <h4 className='house_info-name'>Vlasnik</h4>

          <span className='house_info-value'>{owner || 'Nepoznato'}</span>
        </div>

        <div className='house_info-item'>
          <h4 className='house_info-name'>Cena po danu</h4>

          <span className='house_info-value'>{prettify.price(tax)}</span>
        </div>

        <div className='house_info-item'>
          <h4 className='house_info-name'>{isOwner ? 'Licitacija' : 'Cena'}</h4>

          <span className='house_info-value'>{prettify.price(price)}</span>
        </div>
      </div>

      {isOwner && (
        <div className='house_info-item house_info-item--main'>
          <h4 className='house_info-name'>Otplaćeni dani</h4>

          <span className='house_info-value'>{paid}</span>

          <p className='house_info-remark'>Možete platiti u banci</p>
        </div>
      )}
    </div>
  );
}
