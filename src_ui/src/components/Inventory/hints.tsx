import React from 'react';
import images from 'utils/images';

export default function InventoryHints() {
  return (
    <div className='inventory_hints'>
      <div className='inventory_hints-item'>
        <img
          src={images.getImage('esc-key.svg')}
          alt='mouse left'
        />

        <p className='inventory_hints-text'>Da bi ste zatvorili inventory</p>
      </div>

      <div className='inventory_hints-item'>
        <img
          src={images.getImage('mouse-left.svg')}
          alt='mouse left'
        />

        <p className='inventory_hints-text'>
          Kliknite levim klikom
          <br />
          da bi ste videli informacije o predmetu
        </p>
      </div>

      <div className='inventory_hints-item'>
        <img
          src={images.getImage('zero-key.svg')}
          alt='mouse left'
        />

        <p className='inventory_hints-text'>
          Da bi ste vratili predmet iz brzog slota
        </p>
      </div>
    </div>
  );
}
