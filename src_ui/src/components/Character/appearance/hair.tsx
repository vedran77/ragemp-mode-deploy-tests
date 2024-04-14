import React from 'react';
import Selector from '../selector';

type Props = {
  style: number;
  color: number;
  highlight: number;

  update: (prop: string, value: number) => void;
};

export default function Hair({ style, color, highlight, update }: Props) {
  return (
    <div>
      <Selector
        title='Frizura'
        items={[...Array(74).keys()]}
        value={style}
        onChange={(value) => update('style', value)}
      />
      <Selector
        title='Boja kose'
        items={[...Array(71).keys()]}
        value={color}
        onChange={(value) => update('color', value)}
      />
      <Selector
        title='Dodatna boja kose'
        items={[...Array(71).keys()]}
        value={highlight}
        onChange={(value) => update('highlight', value)}
      />
    </div>
  );
}
