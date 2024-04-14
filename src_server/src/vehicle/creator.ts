import cryptoRandomString from 'crypto-random-string';
import VehicleModel from 'models/Vehicle';
import Builder from './builder';
import vehicleState from './state';
import { Tuning } from './tuning';

class VehicleCreator {
	async buildForPlayer(player: Player, builder: Builder) {
		const govNumber = await this.generateNumber();

		builder.setNumberPlate(govNumber);
		builder.setOwner(player.dbId);

		const vehicle = builder.build();
		const fuel = vehicle.getVariable('fuel');
		const tuning = vehicle.getVariable('tuning');

		const doc = await VehicleModel.create({
			name: vehicle.name,
			owner: player.dbId,
			fuel: fuel.current,
			govNumber,
			tuning,
		});

		mp.vehicles.authorize(vehicle, doc._id);
		player.vehicles.push(vehicle.dbId);

		return vehicle;
	}

	buildTemporary(model: string, position: PositionEx, heading = 90, owner?: VehicleOwner, tuning?: Partial<Tuning>) {
		const builder = new Builder(model, position, heading);

		builder.setNumberPlate('GHETTO');
		builder.installTuning(tuning);
		if (owner) builder.setOwner(owner.player, owner.faction);

		return builder.build();
	}

	spawnForPlayer(player: Player, position: PositionEx, data: VehicleModel, rotation = 90) {
		const builder = new Builder(data.name, position, rotation || 90);

		builder.setNumberPlate(data.govNumber);
		builder.installTuning(data.tuning);
		builder.setOwner(player.dbId);

		const vehicle = builder.build();

		vehicle.inventory = data.inventory;
		vehicleState.setLockStatus(vehicle, true);
		vehicleState.update(vehicle, { ...data.state, engine: false });
		vehicle.setVariable('fuel', {
			...vehicle.getVariable('fuel'),
			current: data.fuel,
		});

		mp.vehicles.authorize(vehicle, data._id);

		return vehicle;
	}

	async generateNumber(custom?: string) {
		let number: string;

		do {
			let str: string = (custom || '') + cryptoRandomString({ length: 2, type: 'numeric' });
			if (!custom) {
				str =
					cryptoRandomString({ length: 2, type: 'numeric' }) +
					'GH' +
					cryptoRandomString({ length: 4, type: 'numeric' });
			}

			const isExists = await VehicleModel.findOne({
				govNumber: str,
			}).countDocuments();

			if (!isExists) number = str;
		} while (!number);

		return number;
	}
}

export { Builder };
export default new VehicleCreator();
