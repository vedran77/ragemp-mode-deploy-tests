import React from 'react';
import { Page, Navbar, List, ListItem } from 'framework7-react';
import vehicles from 'data/vehicles.json';

type Props = {
  name: string;
  owner: string;
  owners: number;
};

export default function DatabaseVehicle(props: Props) {
  const { name, owner, owners } = props;

  return (
    <Page>
      <Navbar
        title='Vozila'
        backLink='Nazad'
      />

      <List inset>
        <ListItem
          title='Ime'
          after={(vehicles as any)[name] ?? name}
        />
        <ListItem
          title='Vlasnik'
          after={owner}
        />
        <ListItem
          title='Ukupno Vlasnika'
          after={owners.toString()}
        />
      </List>
    </Page>
  );
}
