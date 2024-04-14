import React from 'react';
import { Circle } from 'rc-progress';
import { FaWeightHanging, FaHamburger } from 'react-icons/fa';

type Props = {
  type: 'weight' | 'satiety';
  title: string;
  current: number;
  max: number;
};

export default function InventoryIndicator({
  type,
  title,
  current,
  max,
}: Props) {
  return (
    <div className='inventory_indicator'>
      <div className='inventory_indicator-container'>
        <Circle
          className='inventory_indicator-circle'
          strokeWidth={8}
          trailWidth={8}
          trailColor='rgba(255,255,255, 0.5)'
          strokeColor='#cefc2b'
          strokeLinecap='square'
          percent={(current * 100) / max}
        />

        {type === 'weight' ? (
          <FaWeightHanging className='inventory_indicator-icon' />
        ) : (
          <FaHamburger className='inventory_indicator-icon' />
        )}
      </div>
    </div>
  );
}
