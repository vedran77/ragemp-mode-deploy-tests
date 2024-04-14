import VehicleModel from 'models/Vehicle';
import hud from 'helpers/hud';
import blips from 'helpers/blips';
import money from 'helpers/money';
import creator from './creator';
import passengers from './passengers';

const deliveryPrice = 5000;

class VehicleSpawn {
	constructor() {
		mp.events.subscribe({
			'Vehicle-MarkPosition': this.markPosition.bind(this),
			'Vehicle-DeliverForPlayer': this.delivery.bind(this),
		});
	}

	tp(vehicle: VehicleMp, position: PositionEx, rotation = 90, dimension = 0) {
		vehicle.position = new mp.Vector3(position.x, position.y, position.z);
		vehicle.dimension = dimension;

		setTimeout(() => {
			vehicle.rotation = new mp.Vector3(0, 0, rotation);
		}, 100);
	}

	private async delivery(player: Player, id: string, position: PositionEx, atParking: boolean) {
		const vehicle = mp.vehicles.getById(id);

		if (atParking) {
			const dbVeh = await VehicleModel.findById(id).lean();

			if (!dbVeh?.position?.position) {
				hud.showNotification(player, 'info', 'Morate prvo parkirati vozilo', true);
				throw new SilentError('Vehicle position is not set');
			}

			const veh = await this.create(player, dbVeh.position.position, id, dbVeh.position.rotation);

			blips.setWaypoint(player.mp, veh.position);
			hud.showNotification(player, 'info', 'Vozilo je uspješno dostavljeno!', true);

			return;
		}

		const error = this.checkDeliveryErrors(player, vehicle);
		if (error || !player.vehicles.includes(id)) {
			return mp.events.reject(error);
		}

		await money.change(player, 'bank', -deliveryPrice, 'spawn vehicle');

		mp.players.withTimeout(
			player.mp,
			async () => {
				player.mp.setOwnVariable('vehicleDelivery', false);

				if (this.checkDeliveryErrors(player, vehicle)) return;

				const veh = await this.create(player, position, id);

				blips.setWaypoint(player.mp, veh.position);
				hud.showNotification(player, 'info', 'Vozilo je uspješno dostavljeno!');
			},
			15 * 1000
		);

		player.mp.setOwnVariable('vehicleDelivery', true);
	}

	private async create(player: Player, position: PositionEx, vehicleId: string, rotation?: number) {
		const vehicle = mp.vehicles.getById(vehicleId);

		if (vehicle) {
			this.tp(vehicle, position, rotation || player.mp.dimension);
			return vehicle;
		}

		const data = await VehicleModel.findById(vehicleId).lean();

		return creator.spawnForPlayer(player, position, data as VehicleModel, rotation);
	}

	private markPosition(player: Player, id: string) {
		const vehicle = mp.vehicles.getById(id);

		if (!vehicle) throw new SilentError("vehicle doesn't exists");

		blips.setWaypoint(player.mp, vehicle.position);
	}

	private checkDeliveryErrors(player: Player, vehicle?: VehicleMp) {
		let error: string;

		if (player.mp.getOwnVariable('vehicleDelivery')) error = 'Vozilo je na putu';
		else if (passengers.isExists(vehicle)) error = 'U vozilo je putnik, sačekajte da izađe!';

		return error;
	}
}

export default new VehicleSpawn();
