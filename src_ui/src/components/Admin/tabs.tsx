import React from 'react';
import Ban from './ban';
import House from './house';
import Demorgan from './demorgan';
import Journal from './journal';

type Tab = {
  name: string;
  component?: React.ComponentClass<any, any> | React.FunctionComponent;
};

const helperTabs: Tab[] = [
  {
    name: 'Zatvor',
    component: Demorgan,
  },
];

const adminTabs: Tab[] = [
  {
    name: 'Ban',
    component: Ban,
  },
];

const gmTabs: Tab[] = [
  {
    name: 'Logovi',
    component: Journal,
  },
];

const ownerTabs: Tab[] = [
  {
    name: 'Kuće',
    component: House,
  },
];

export default [
  helperTabs,
  [...helperTabs, ...adminTabs],
  [...helperTabs, ...adminTabs, ...gmTabs],
  [...helperTabs, ...adminTabs, ...gmTabs, ...ownerTabs],
];
