import React from 'react';
import classNames from 'classnames';
import images from 'utils/images';

const items = {
  hat: 'Kapa',
  jacket: 'Jakna',
  shirt: 'Majica',
  pants: 'Pantalone',
  shoes: 'Obuća',
  glasses: 'Naočare',
  mask: 'Maska',
  accessories: 'Dodaci',
  watch: 'Sat',
};

type Props = {
  current: string;
  setCategory: (name: string) => void;
};

export default function ClothingShopCategories({
  current,
  setCategory,
}: Props) {
  return (
    <div className='clothing-shop_categories'>
      {Object.entries(items).map(([name, title]) => (
        <div
          className={classNames('clothing-shop_categories-item', {
            active: current === name,
          })}
          key={name}
          onClick={() => setCategory(name)}
        >
          <img
            src={images.getImage(`${name}.svg`)}
            alt={title}
          />
        </div>
      ))}
    </div>
  );
}
