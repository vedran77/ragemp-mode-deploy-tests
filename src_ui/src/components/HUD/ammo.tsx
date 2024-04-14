import React, { useEffect, useState } from 'react';
import images from 'utils/images';
import rpc from 'utils/rpc';

export default function Ammo() {
  const [count, setCount] = useState<number>(0);
  const [weaponName, setWeaponName] = useState<string>('');
  const [weaponId, setWeaponId] = useState<number>(0);
  const [totalAmmo, setTotalAmmo] = useState<number>(0);

  useEffect(() => {
    rpc.register('HUD-SetAmmo', (data) => {
      setCount(data.count);
      setWeaponId(data.weaponHash);
      setTotalAmmo(data.totalAmmo);
    });

    return () => {
      rpc.unregister('HUD-SetAmmo');
    };
  }, []);

  return weaponId && weaponId !== 2725352035 ? (
    <div className='hud_ammo'>
      <img
        className='weapon'
        src={images.getImage(`weapons/${weaponId}.png`)}
      />
      <h4>{weaponName}</h4>
      <p className='weapon_ammo'>
        {count}/{totalAmmo}
      </p>
    </div>
  ) : null;
}
