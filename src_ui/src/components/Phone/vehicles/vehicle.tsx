import React from 'react';
import vehicles from 'data/vehicles.json';
import Navigation from '../partials/navigation';
import Button from '../partials/button';
import Group from '../partials/group';
import { VehicleData } from './index';

type Props = {
  data: VehicleData;

  getPosition: () => void;
  spawn: (atParking: boolean) => void;
  despawn: () => void;
  close: () => void;
};

export default function Vehicle({
  data,
  getPosition,
  spawn,
  despawn,
  close,
}: Props) {
  return (
    <div className='vehicles_vehicle'>
      <Navigation close={{ title: 'Vozila', onClick: close }} />

      <Group className='vehicles_vehicle-info'>
        <Button current={(vehicles as any)[data.model] ?? data.model}>
          Ime
        </Button>
        <Button current={data.govNumber || 'NEREGISTROVAN'}>Tablice</Button>
      </Group>

      <Group className='vehicles_vehicle-actions'>
        <Button
          color='blue'
          onClick={() => spawn(false)}
        >
          Pozovite za 5000$
        </Button>

        {!data.spawned && (
          <Button
            color='blue'
            onClick={() => spawn(true)}
          >
            Dostavite na parking
          </Button>
        )}

        {data.spawned && (
          <Button
            color='red'
            onClick={despawn}
          >
            Vrati u garažu
          </Button>
        )}

        <Button
          color='blue'
          onClick={getPosition}
        >
          Lociraj
        </Button>
      </Group>
    </div>
  );
}
