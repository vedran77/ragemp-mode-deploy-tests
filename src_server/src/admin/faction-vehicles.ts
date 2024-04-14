import VehicleModel from 'models/Vehicle';
import factions from 'factions';
import vehicleCreator, { Builder } from 'vehicle/creator';
import permissions from './permissions';
import journal from './journal';
import { chatErrorMessages } from 'helpers/commands';
import { hexToRGB } from 'utils/vehicle';

class AdminVehicle {
	constructor() {
		mp.events.addCommands({
			afactionveh: this.createVehicle.bind(this),
			afactiondeveh: this.deleteVehicle.bind(this),
		});
	}

	private async createVehicle(admin: Player, data: string) {
		if (!permissions.hasPermission(admin, 'manager') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (!data) {
			admin.mp.outputChatBox(chatErrorMessages.error('/aveh [faction] [model] [color1] [color2] [plate]'));
			return;
		}

		const [faction, model, color1, color2, plate] = data.split(' ');

		if (!factions.getFaction(faction)) {
			admin.mp.outputChatBox(chatErrorMessages.error('Fakcija ne postoji.'));
			return;
		}

		if (!model) {
			admin.mp.outputChatBox(chatErrorMessages.error('Model vozila nije unet.'));
			return;
		}

		if (plate && plate.length > 8) {
			admin.mp.outputChatBox(chatErrorMessages.error('Tablice ne mogu imati vise od 8 karaktera.'));
			return;
		}

		if (!color1 || !color2) {
			admin.mp.outputChatBox(chatErrorMessages.error('Morate uneti boje vozila.'));
			return;
		} else if (color1.length !== 6 || color2.length !== 6) {
			admin.mp.outputChatBox(chatErrorMessages.error('Unesite HEX boju bez #.'));
			return;
		}

		const rgb1 = hexToRGB(color1);
		const rgb2 = hexToRGB(color2);

		const { position, heading } = admin.mp;
		const builder = new Builder(model, position, heading);
		builder.installTuning({ paint: { primary: [...rgb1, 1], secondary: [...rgb2, 1] } });
		const govNumber = await vehicleCreator.generateNumber(plate);

		builder.setNumberPlate(govNumber);
		builder.setOwner(null, faction);
		const vehicle = builder.build();

		const fuel = vehicle.getVariable('fuel');
		const tuning = vehicle.getVariable('tuning');

		const dbVehicle = await VehicleModel.create({
			name: vehicle.name,
			fuel: fuel.current,
			faction,
			govNumber,
			tuning,
		});

		mp.vehicles.authorize(vehicle, dbVehicle._id);

		const factionManager = factions.getFaction(faction);
		const factionVehicles = factionManager?.garage?.getVehicles() || [];
		factionVehicles.push({
			dbId: dbVehicle._id,
			name: `${vehicle.name} - ${govNumber}`,
			model: vehicle.name,
			govNumber,
			position: { ...position, rot: heading },
		});
		factionManager?.garage?.loadVehicles(factionVehicles, false);

		factionManager?.garage?.vehicles.set(dbVehicle._id, vehicle);

		journal.recordAction(
			admin,
			'FactionVehicleCreate',
			admin ? `${admin.getName()} | ${model}` : model,
			admin?.dbId
		);
	}

	private deleteVehicle(admin: Player) {
		if (!permissions.hasPermission(admin, 'manager') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		const vehicle = admin.mp.vehicle;

		if (vehicle?.type !== 'vehicle') {
			admin.mp.outputChatBox(chatErrorMessages.error('Moras da budes u vozilo.'));
			return;
		}

		const { owner } = vehicle;

		if (owner?.faction) {
			VehicleModel.deleteOne({ _id: vehicle.dbId }).exec();

			const factionManager = factions.getFaction(owner.faction);
			factionManager?.garage?.loadVehicles(
				factionManager?.garage.getVehicles().filter((item) => item.dbId === vehicle.dbId),
				false
			);
		}
		vehicle.destroy();
	}
}

const vehicle = new AdminVehicle();
