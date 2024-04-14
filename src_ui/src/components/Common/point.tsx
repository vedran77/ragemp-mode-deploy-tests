import React from 'react';
import classNames from 'classnames';
import images from 'utils/images';
import prettify from 'utils/prettify';
import PointIcon from '../../assets/images/gh-coin.png';

type Props = {
  className?: string;
  amount: number;
};

export default function Point({ amount, className }: Props) {
  return (
    <div className={classNames('point', className)}>
      <span>{prettify.price(amount).replace('$', '')}</span>

      <img
        src={PointIcon}
        className='point-icon'
      />
    </div>
  );
}
