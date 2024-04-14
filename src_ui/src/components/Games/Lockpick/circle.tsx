import React from 'react';
import { Circle } from 'rc-progress';
import { random } from 'lodash';

type Props = {
  point: React.RefObject<HTMLDivElement>;
  pointer: React.RefObject<HTMLDivElement>;

  rotations: {
    point: number;
    pointer: number;
  };

  onClick: () => void;
};

export default function LockpickCircle({
  point,
  pointer,
  rotations,
  onClick,
}: Props) {
  return (
    <div
      className='lockpick_circle'
      onClick={onClick}
    >
      <Circle
        className='lockpick_circle-progress'
        strokeWidth={5}
        trailWidth={5}
        trailColor='rgba(17, 25, 40, 0.8)'
        strokeColor='#cefc2b'
        strokeLinecap='square'
      />

      <div
        ref={point}
        className='lockpick_circle-point'
        style={{ transform: `rotate(${rotations.point}deg)` }}
      />
      <div
        ref={pointer}
        className='lockpick_circle-pointer'
        style={{
          transform: `rotate(${rotations.pointer}deg)`,
          animationDuration: `${random(0.7, 1.0)}s`,
        }}
      />
    </div>
  );
}
