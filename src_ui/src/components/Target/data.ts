export const sections: {
  [name: string]: {
    [name: string]: string | [string, string] | string[];
  };
} = {
  player: {
    organization: 'Organizacija',
    docs: 'Dokumenta',
    property: 'Imovina',
    others: 'Ostalo',
  },
  self: {
    mood: 'Raspoloženje',
    walking: 'Način hodanja',
    animations: 'Animacije',
    docs: 'Dokumenta',
  },
  vehicle: {
    seatbelt: 'Sigurnosni pojas',
    lock: 'Kontrola brave',
    doors: 'Vrata',
    trunk: 'Gepek',
    passengers: 'Putnici',
    refuel: 'Dopuna goriva',
    repair: 'Popravka',
    park: ['Parkiranje', 'vehicle'],
  },
};

export const groups: typeof sections = {
  organization: {},
  others: {
    money: 'Daj novac',
    handshake: 'Rukovanje',
  },
  docs: {
    passport: 'Lična Karta',
    licenses: 'Dozvole',
  },
  property: {
    vehicle: 'Prodaja vozila',
    house: 'Prodaja kuće',
    business: 'Prodaja biznisa',
  },
  passengers: {},
  doors: {
    hood: 'Hauba',
    front_left: ['Prednja leva', 'doors'],
    front_right: ['Prednja desna', 'doors'],
    rear_left: ['Zadnja leva', 'doors'],
    rear_right: ['Zadnja desna', 'doors'],
  },
  trunk: {
    inventory: ['Pristupi', 'trunk'],
    access: ['Otvori/Zatvori', 'trunk'],
  },
  mood: {
    normal: ['Normalan', 'mood'],
    aiming: ['Razigran', 'mood'],
    angry: ['Ljut', 'mood'],
    drunk: ['Pijan', 'mood'],
    happy: ['Srećan', 'mood'],
    injured: ['Povređen', 'mood'],
    stressed: ['Stresiran', 'mood'],
    sulking: ['Uvređen', 'mood'],
  },
  walking: {
    normal: ['Normalan', 'walking'],
    drunk: ['Pijan', 'walking'],
    fat: ['Debeo', 'walking'],
    gangster: ['Gangster', 'walking'],
    quick: ['U žurbi', 'walking'],
    sad: ['Tužan', 'walking'],
    injured: ['Povređen', 'walking'],
  },
  animations: {},
};
