import VehicleModel from 'models/Vehicle';
import factions from 'factions';
import vehicleCreator from 'vehicle/creator';
import permissions from './permissions';
import journal from './journal';
import { chatErrorMessages } from 'helpers/commands';
import vehicleTuning from 'vehicle/tuning';

class AdminVehicle {
	constructor() {
		mp.events.addCommands({
			aveh: this.createTemporaryVehicle.bind(this),
			adeveh: this.despawnVehicle.bind(this),
			avehextra: this.setVehicleExtra.bind(this),
			avehlivery: this.setVehicleLivery.bind(this),
			apark: this.parkVehicle.bind(this),
		});
	}

	private async setVehicleExtra(admin: Player, data: string) {
		if (!permissions.hasPermission(admin, 'manager') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (!data) {
			admin.mp.outputChatBox(chatErrorMessages.error('/avehextra [extra]'));
			return;
		}

		const extra = parseInt(data);

		const vehicle = admin.mp.vehicle;

		if (!vehicle) {
			admin.mp.outputChatBox(chatErrorMessages.error('Moras da budes u vozilu.'));
			return;
		}

		const tuning = vehicle.getVariable('tuning');

		vehicle.setExtra(extra, !vehicle.getExtra(extra));

		if (!tuning.extras.includes(extra) && vehicle.getExtra(extra)) {
			tuning.extras.push(extra);
		} else {
			tuning.extras = tuning.extras.filter((e) => e !== extra);
		}

		await vehicleTuning.update(vehicle, tuning);
	}

	private async setVehicleLivery(admin: Player, data: string) {
		if (!permissions.hasPermission(admin, 'manager') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (!data) {
			admin.mp.outputChatBox(chatErrorMessages.error('/avehlivery [broj]'));
			return;
		}

		const livery = parseInt(data);

		const vehicle = admin.mp.vehicle;

		if (!vehicle) {
			admin.mp.outputChatBox(chatErrorMessages.error('Moras da budes u vozilu.'));
			return;
		}

		const tuning = vehicle.getVariable('tuning');
		tuning.livery = livery;

		await vehicleTuning.update(vehicle, tuning);
	}

	private createTemporaryVehicle(admin: Player, model: string) {
		if (!permissions.hasPermission(admin, 'admin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (!model) {
			admin.mp.outputChatBox(chatErrorMessages.error('/aveh [model]'));
			return;
		}

		const { position } = admin.mp;
		vehicleCreator.buildTemporary(model, position, 90, {
			player: admin.dbId,
		});

		journal.recordAction(
			admin,
			'temporary_vehicle_create',
			admin ? `${admin.getName()} | ${model}` : model,
			admin?.dbId
		);
	}

	private despawnVehicle(admin: Player) {
		if (!permissions.hasPermission(admin, 'admin') || !admin.mp.getVariable('ADUTY')) {
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
			const { garage } = factions.getFaction(owner.faction);
			garage.despawnVehicle(vehicle);
		} else {
			mp.vehicles.delete(vehicle);
		}
	}

	private async parkVehicle(admin: Player) {
		if (!permissions.hasPermission(admin, 'manager') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		const vehicle = admin.mp.vehicle;

		if (!vehicle || !vehicle.dbId) {
			admin.mp.outputChatBox(chatErrorMessages.error('Moras da budes u vozilo.'));
			return;
		}

		if (vehicle.dbId) {
			const vehicleData = await VehicleModel.findById(vehicle.dbId);

			if (!vehicleData) {
				admin.mp.outputChatBox(chatErrorMessages.error('Vozilo nije pronadjeno.'));
				return;
			}

			vehicleData.position = {
				position: vehicle.position,
				rotation: vehicle.heading,
			};

			if (vehicle.owner?.faction) {
				vehicle.setVariable('spawnPosition', { ...vehicle.position, rot: vehicle.heading });

				const faction = factions.getFaction(vehicle.owner.faction);
				const vehicles = faction.garage.getVehicles();

				const index = vehicles.findIndex((item) => item.dbId === vehicle.dbId);
				if (index !== -1) {
					vehicles[index].position = {
						...vehicle.position,
						rot: vehicle.heading,
					};
				}

				faction?.garage?.loadVehicles(vehicles, false);
			}

			await vehicleData.save();
		}
	}
}

const vehicle = new AdminVehicle();
