import moment from 'moment';
import VehicleModel from 'models/Vehicle';
import logger from 'utils/logger';
import hud from 'helpers/hud';
import factions from 'factions';
import Faction from '../faction';
import Garage from './garage';

class GarageCtrl {
	constructor() {
		mp.events.subscribe({
			'Factions-ShowGarage': this.showMenu.bind(this),
			'Factions-SpawnVehicle': this.spawnVehicle.bind(this),
			'Factions-DespawnVehicle': this.despawnVehicle.bind(this),
		});
	}

	private showMenu(player: Player) {
		const faction = factions.getFaction(player.faction);
		this.checkAccess(player, faction);

		faction.garage.showMenu(player);
	}

	private spawnVehicle(player: Player, model: string) {
		const faction = factions.getFaction(player.faction);
		this.checkAccess(player, faction);

		// if (this.isAlreadyTook(player, faction.garage)) {
		// 	return mp.events.reject('Već ste stvorili vozilo, respawnujte ga pomoću tableta');
		// }

		return faction.garage.spawnVehicle(player, model);
	}

	private despawnVehicle(player: Player, id: string) {
		const faction = factions.getFaction(player.faction);
		this.checkAccess(player, faction);

		const vehicle = faction.garage.vehicles.get(id);
		if (!vehicle || vehicle.despawnAt) throw new SilentError("vehicle doesn't exists");

		vehicle.despawnAt = moment().add(5, 'seconds').valueOf();

		return Array.from(faction.garage.vehicles.entries()).flatMap(([id, vehicle]) => ({
			id,
			model: vehicle.name,
			govNumber: vehicle.numberPlate,
		}));
	}

	private checkAccess(player: Player, faction: Faction) {
		if (!faction?.garage || !faction.hasAccess(player, 'garage')) {
			hud.showNotification(player, 'error', 'Nemate pristup garaži');

			throw new SilentError('access denied');
		}
	}

	private isAlreadyTook(player: Player, garage: Garage) {
		const vehicle = Array.from(garage.vehicles.values()).find(({ owner }) => owner?.player === player.dbId);

		return !!vehicle;
	}

	async loadVehicles() {
		const cursor = await VehicleModel.find({ faction: { $exists: true, $ne: '' } })
			.lean()
			.cursor();

		let loaded = 0;
		const allFactionVehicles: { [key: string]: VehicleModel[] } = {};
		cursor.on('data', (item: VehicleModel) => {
			const faction = factions.getFaction(item.faction);
			if (!faction) return;

			if (!allFactionVehicles[item.faction]) allFactionVehicles[item.faction] = [];
			allFactionVehicles[item.faction].push(item);

			loaded++;
		});

		cursor.on('close', () => {
			logger.success(`Faction-Vehicles loaded: ${loaded}`);

			for (const [faction, vehicles] of Object.entries(allFactionVehicles)) {
				factions.getFaction(faction).garage.loadVehicles(
					vehicles.map((item) => ({
						dbId: item._id,
						name: item.name + ' - ' + item.govNumber,
						model: item.name,
						tuning: item.tuning,
						govNumber: item.govNumber,
						...((item?.position?.position && {
							position: { ...item.position.position, rot: item.position.rotation },
						}) ||
							{}),
					}))
				);
			}
		});
	}
}

const controller = new GarageCtrl();

export { Garage, controller as GarageCtrl };
