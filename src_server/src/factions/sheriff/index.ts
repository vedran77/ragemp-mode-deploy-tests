import factions from 'factions';
import FactionBuilder from 'factions/builder';
import { Garage } from 'factions/garage';
import { Wardrobe } from 'factions/wardrobe';
import { randomColor, randomNumber } from 'utils/vehicle';

const randColor = randomColor(0, 255);

const name = 'lssd';

const coords = factions.getCoords(name);
const wardrobe = new Wardrobe();

const garage = new Garage(coords.garage, name, {
	armor: 2,
	lights: 0,
	paint: { primary: [0, 0, 0, 1], secondary: [0, 0, 0, 1] },
});

const builder = new FactionBuilder(name, true, 'law');

builder.createWarehouse(coords.warehouse, 50000);
builder.createInventory(coords.inventory, { cells: 180 });
builder.createWorkshop(coords.workshop, {
	handcuffs: 5,
	nightstick: 8,
	stungun: 10,
	knife: 5,
	combatpistol: 12,
	pistol: 15,
	pistol_mk2: 25,
	beanbag: 30,
	smg: 50,
	combatpdw: 70,
	pumpshotgun: 90,
	carbinerifle: 120,
	carbinerifle_mk2: 150,
	tacticalrifle: 200,
	'9mm': 1,
	'7.62mm': 3,
	'12gauge': 5,
	'12non-lethal': 1,
	armor_medium: 5,
	armor_heavy: 15,
});
builder.setWardrobe(coords.wardrobe, wardrobe);
builder.setGarage(garage);
builder.makeBlip(coords.spawn, {
	name: "Los Santos Sheriff's Department",
	model: 60,
	color: 2,
});

const sheriff = builder.build();

export default sheriff;
