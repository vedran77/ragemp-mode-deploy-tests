import React from 'react';
import { Page, Navbar, List, ListItem } from 'framework7-react';

export default function Database() {
  return (
    <Page>
      <Navbar title='Baza podataka' />

      <List inset>
        <ListItem
          link='users/'
          title='Građanin'
        />
        <ListItem
          link='vehicles/'
          title='Vozila'
        />
        <ListItem
          link='/wanted/'
          title='Poternica'
        />
      </List>
    </Page>
  );
}
