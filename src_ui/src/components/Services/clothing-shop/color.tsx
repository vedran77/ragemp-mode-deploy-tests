import React from 'react';
import Slider from 'rc-slider';
import Selector from 'components/Common/selector';

type Props = {
  current: number;
  amount: number;
  setColor: (index: number) => void;
};

export default function ClothingShopColor({
  current,
  amount,
  setColor,
}: Props) {
  return (
    <div className='clothing-shop_color'>
      <h4 className='clothing-shop_color-title'>Boja</h4>

      <Selector
        className='clothing-shop_selector'
        value={current}
        items={[...Array(amount).keys()]}
        onChange={setColor}
      />
    </div>
  );
}
