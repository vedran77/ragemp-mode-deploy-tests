const jobs: {
  [name: string]: { title: string; description: string; requirements: string };
} = {
  waterfront: {
    title: 'LUČKI RADNIK',
    description:
      'Rad u luci je prilicno prasnjav. \n Morat ćeš nositi terete i raznositi velike kontejnere s teretom pomoću posebne opreme. \n Nakon postizanja novog nivoa, plata za tvoj trud će se povećava. Svaki nivo posla donosi nove zadatke.',
    requirements: 'Level 1',
  },
  building: {
    title: 'GRAĐEVINAR',
    description:
      'Grad aktivno raste, ima mnogo posla. \n Na gradilištu ćeš morati nositi terete i istovarati teret sa kamiona.\n Nakon postizanja novog nivoa, plata za tvoj trud će se povećavati. Svaki nivo posla donosi nove zadatke.',
    requirements: 'Level 1',
  },
  postal: {
    title: 'POŠTAR',
    description:
      'Ima jako puno posla!! \n Građani cekaju svoja pisma i pakete. \n Moraćes raznositi pisma i dostavljati pakete! \n Nakon postizanja novog nivoa, plata za tvoj trud će se povećavati. Svaki nivo posla donosi nove zadatke.',
    requirements: 'Level 2, vozačka dozvola B kategorije',
  },
  car_theft: {
    title: 'KRADLJIVAC AUTOMOBILA',
    description:
      'Najvaznije - ovaj posao je ilegalan! \n Ukoliko uđes u ovaj posao, nema povratka! Moraćes provaljivati automobile pomoću alata i dostavljati ih kupcima na određena mesta.\n Nakon postizanja novog nivoa, plata za tvoj trud ce se povećavati. Svaki nivo posla donosi nove zadatke.',
    requirements: 'Level 3, alat za obijanje (lockpicks)',
  },
  smuggling: {
    title: 'DILER',
    description:
      'Po primitku robe - uputi se prema naznacenoj tački. Koordinate ćeš dobiti putem GPS-a. \n Kretanje prema koordinatama obavi pažljivo, izbjegavajući privlačenje nepotrebne pažnje. \n Ukoliko te primete krivi ljudi - mogli bi te oteti na duže vreme.',
    requirements: 'Level 3',
  },
  trucking: {
    title: 'Kamiondzija',
    description:
      'Grad aktivno raste, ima mnogo posla. \n Na gradilištu ćeš morati nositi terete i istovarati teret sa kamiona.\n Nakon postizanja novog nivoa, plata za tvoj trud će se povećavati. Svaki nivo posla donosi nove zadatke.',
    requirements: 'Level 1',
  },
};

export default jobs;
