import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';
import Cell from './cell';

type Action = {
  title: string;
  icon?: string;
};

const actionList: { [name: string]: Action } = {
  invite: {
    title: 'Pozovite u organizaciju',
    icon: 'handshake',
  },
  docs: {
    title: 'Pokažite dokumenta',
  },
  cuff: {
    title: 'Stavite lisice',
    icon: 'handcuffs',
  },
  uncuff: {
    title: 'Skinite lisice',
    icon: 'handcuffs',
  },
  tie: {
    title: 'Vežite vezice',
    icon: 'cable_tie',
  },
  untie: {
    title: 'Odvežite vezice',
    icon: 'cable_tie',
  },
  follow: {
    title: 'Vucite',
    icon: 'detain',
  },
  unfollow: {
    title: 'Prestanite vuci',
    icon: 'detain',
  },
  headsack_enable: {
    title: 'Stavite torbu na glavu',
    icon: 'sack',
  },
  headsack_disable: {
    title: 'Skinite torbu s glave',
    icon: 'sack',
  },
  unmask: {
    title: 'Skini masku',
    icon: 'mask',
  },
  frisk: {
    title: 'Pretresi',
    icon: 'backpack',
  },
  vehicle: {
    title: 'Stavite u vozilo',
  },
  heal: {
    title: 'Ponudi lečenje',
    icon: 'pill',
  },
  reanimate: {
    title: 'Reanimiraj',
  },
  medcard_physical: {
    title: 'Lekarsko uverenje',
    icon: 'medcard',
  },
  medcard_mental: {
    title: 'Psihološko uverenje',
    icon: 'medcard',
  },
  military_id: {
    title: 'Vojna legitimacija',
    icon: 'licenses',
  },
};

export default function TargetOrganization() {
  const [actions, setActions] = useState<string[]>([]);

  useEffect(() => {
    rpc.callClient('FactionActions-GetItems').then(setActions);
  }, []);

  function callAction(action: string) {
    rpc.callClient('FactionActions-Call', action);
  }

  return (
    <>
      {actions.map((item) => {
        const action = actionList[item];

        return (
          <Cell
            key={item}
            label={action.icon ?? item}
            title={action.title}
            onClick={() => callAction(item)}
          />
        );
      })}
    </>
  );
}
