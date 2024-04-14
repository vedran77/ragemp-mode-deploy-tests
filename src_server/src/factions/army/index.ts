import factions from 'factions';
import FactionBuilder from 'factions/builder';
import { Garage } from 'factions/garage';
import { Wardrobe } from 'factions/wardrobe';
import '../supply';
import './ticket';

const name = 'sang';

const coords = factions.getCoords(name);
const wardrobe = new Wardrobe();

const garage = new Garage(coords.garage, name, {
	armor: 2,
	paint: { primary: [217, 205, 152, 0], secondary: [217, 205, 152, 0] },
});

const builder = new FactionBuilder(name, true, 'law');

builder.createWarehouse(coords.warehouse, 100000);
builder.createInventory(coords.inventory, { cells: 180 });
builder.createWorkshop(coords.workshop, {
	handcuffs: 5,
	nightstick: 8,
	stungun: 10,
	knife: 5,
	pistol: 15,
	combatpistol: 18,
	smg: 50,
	combatpdw: 70,
	heavyshotgun: 110,
	carbinerifle: 120,
	assaultrifle: 130,
	'9mm': 1,
	'7.62mm': 3,
	'12gauge': 5,
	'12non-lethal': 1,
	armor_medium: 5,
	armor_heavy: 15,
});
builder.setWardrobe(coords.wardrobe, wardrobe);
builder.setGarage(garage);
builder.makeBlip(coords.spawn, { name: 'SANG', model: 758, color: 25 });

const army = builder.build();

export default army;
