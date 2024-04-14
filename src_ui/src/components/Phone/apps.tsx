import Main from './main';
import Keypad from './keypad';
import Contacts from './contacts';
import Settings from './settings';
import Maps from './maps';
import Sim from './sim';
import Vehicles from './vehicles';
import Referral from './referral';
import Donation from './donation';

export type PhoneApp = {
  name: string;
  component: any;
  attached?: boolean;
};

const apps: { [key: string]: PhoneApp } = {
  maps: {
    name: 'Mapa',
    component: Maps,
  },
  sim: {
    name: 'Racoon',
    component: Sim,
  },
  referral: {
    name: 'Referral',
    component: Referral,
  },
  vehicles: {
    name: 'Vozila',
    component: Vehicles,
  },
  donation: {
    name: 'Donacije',
    component: Donation,
  },

  calls: {
    name: 'Poziv',
    component: Keypad,
    attached: true,
  },
  contacts: {
    name: 'Kontakti',
    component: Contacts,
    attached: true,
  },
  messages: {
    name: 'Poruke',
    component: Main,
    attached: true,
  },
  settings: {
    name: 'Podešavanja',
    component: Settings,
    attached: true,
  },
};

export default apps;
