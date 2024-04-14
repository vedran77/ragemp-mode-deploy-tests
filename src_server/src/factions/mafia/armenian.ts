import factions from 'factions';
import FactionBuilder from 'factions/builder';
import { Garage } from 'factions/garage';

const name = 'armenian';

const coords = factions.getCoords(name);
const garage = new Garage(coords.garage, name, { paint: { primary: [56, 7, 4, 0], secondary: [56, 7, 4, 0] } }, true);

const builder = new FactionBuilder(name, false, 'mafia');

builder.createWarehouse(coords.warehouse, 40000);
builder.createInventory(coords.inventory, { cells: 180 });
builder.createWorkshop(coords.workshop, {
	knife: 10,
	pistol: 20,
	doubleaction: 40,
	revolver: 50,
	microsmg: 60,
	machinepistol: 75,
	sawnoffshotgun: 90,
	compactrifle: 120,
	assaultrifle: 150,
	'9mm': 2,
	'7.62mm': 5,
	'12gauge': 7,
	armor_light: 15,
});
builder.setGarage(garage);
builder.makeBlip(coords.spawn, { name: 'Armenian Mafia', model: 76, color: 1 });

const armenian = builder.build();

export default armenian;
