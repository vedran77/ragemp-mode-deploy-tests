import factions from 'factions';
import FactionBuilder from 'factions/builder';
import { Garage } from 'factions/garage';
import { Wardrobe } from 'factions/wardrobe';
import { randomNumber } from 'utils/vehicle';
import './licenses';
import './health';

const name = 'lsfd';

const coords = factions.getCoords(name);
const wardrobe = new Wardrobe();

const garage = new Garage(coords.garage, name, {});

const builder = new FactionBuilder(name, true, 'law');

builder.createWarehouse(coords.warehouse, 30000);
builder.createInventory(coords.inventory, { cells: 180 });
builder.createWorkshop(coords.workshop, {
	medkit: 15,
});
// napraviti da se moze teleportati

builder.setWardrobe(coords.wardrobe, wardrobe);
builder.setGarage(garage);

builder.makeBlip(coords.spawn, {
	name: 'Los Santos Fire Department',
	model: 61,
	color: 1,
	scale: 1.1,
});

const ems = builder.build();

export default ems;
