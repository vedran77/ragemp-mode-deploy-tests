import VehicleModel from 'models/Vehicle';
import VehicleState from './state';
import factions from 'factions';
import owning from './owning';
import passengers from './passengers';

class VehicleDespawn {
	private despawnTimeout: number;

	constructor() {
		this.despawnTimeout = 2;

		mp.events.subscribe({
			'Vehicle-DespawnItem': this.despawnByPlayer.bind(this),
		});
	}

	despawnFactionsVehicles() {
		Object.values(factions.items).forEach(({ garage }) => {
			if (!garage) return;

			garage.vehicles.forEach((vehicle) => {
				if (vehicle.despawnAt && Date.now() >= vehicle.despawnAt) {
					garage.despawnVehicle(vehicle);
				}
			});
		});
	}

	despawnPlayerVehicles(player: Player) {
		player.vehicles.forEach((item) =>
			this.removeVehicle(mp.vehicles.getById(item))
		);
	}

	private async despawnByPlayer(player: Player, id: string) {
		const vehicle = mp.vehicles.getById(id);
		const error = this.checkErrors(player, vehicle);

		if (error) return mp.events.reject(error);

		const dbVeh = await VehicleModel.findById(id);

		let isAtParking = false;
		if (dbVeh?.position?.position) {
			const { x, y, z } = dbVeh.position.position;

			isAtParking = vehicle.dist(new mp.Vector3(x, y, z)) < 10;
		}

		// Kick out passengers
		passengers.kickAll(vehicle);

		// Turn off engine
		VehicleState.setEngineStatus(vehicle, false);
		dbVeh.state.engine = false;
		await dbVeh.save();

		mp.players.withTimeout(
			player.mp,
			() => {
				player.mp.setOwnVariable('vehicleDespawn', false);

				if (this.checkErrors(player, vehicle)) return;

				this.removeVehicle(vehicle);
			},
			isAtParking ? 2000 : this.despawnTimeout * 15 * 1000
		);

		player.mp.setOwnVariable('vehicleDespawn', true);
	}

	private removeVehicle(vehicle: VehicleMp) {
		mp.vehicles.delete(vehicle);
	}

	private checkErrors(player: Player, vehicle: VehicleMp) {
		let error: string;

		if (!vehicle) error = 'Vozilo nije pronadjeno';
		else if (player.mp.getOwnVariable('vehicleDespawn'))
			error = 'Sačekajte da se vozilo vrati u garažu';
		else if (!owning.isRealOwner(vehicle, player))
			error = 'Vi niste vlasnik vozila!';
		else if (
			passengers.isExists(vehicle) &&
			vehicle.getOccupant(0)?.id !== player.mp?.id
		)
			error = 'U vozilo je putnik, sačekajte da izađe!';

		return error;
	}
}

export default new VehicleDespawn();
