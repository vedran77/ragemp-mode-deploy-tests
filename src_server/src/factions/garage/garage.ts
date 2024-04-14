import VehicleModel from 'models/Vehicle';
import { getClosestVehicleInRange } from 'utils/vehicle';
import { Tuning } from 'vehicle/tuning';
import { Builder } from 'vehicle/creator';
import vehicles from 'data/vehicles.json';

type Position = PositionEx & { rot: number };
type SpawnPositions = {
	[type in 'all' | 'helicopter' | 'plane']?: Position[];
};

type VehModel = {
	dbId?: string;
	name: string;
	model: string;
	tuning?: Partial<Tuning>;
	govNumber?: string;
	position?: Position;
};

class FactionGarage {
	public readonly vehicles: Map<string, VehicleMp>;
	private models: VehModel[] = [];

	constructor(
		private positions: SpawnPositions,
		private faction: string,
		private tuning: Partial<Tuning>,
		private spawnOnInit?: boolean
	) {
		this.vehicles = new Map();
	}

	getVehicles() {
		return this.models.slice(0);
	}
	loadVehicles(models: VehModel[], handleInitSpawn: boolean = true) {
		this.models = models;

		if (handleInitSpawn && this.spawnOnInit && this.models.length > 0) this.spawnOnInitFunc();
	}

	showMenu(player: Player) {
		player.callEvent('Factions-ShowGarage', [
			this.models
				.filter((item) => !this.vehicles.has(item?.dbId))
				.map((item) => ({
					name: item.name,
					model: item.model,
					plate: item.govNumber,
				})),
		]);
	}

	private spawnOnInitFunc() {
		this.models.forEach((model) => {
			if (model.position) {
				const builder = new Builder(model.model as string, model.position, model.position.rot, 0);

				builder.setNumberPlate(this.getNumberPlate(this.faction));
				builder.installTuning(this.tuning);
				builder.setOwner(null, this.faction);

				const vehicle = builder.build();
				mp.vehicles.authorize(vehicle, model.dbId);

				this.vehicles.set(vehicle.dbId, vehicle);
			}
		});
	}

	spawnVehicle(player: Player, model: string) {
		const position = this.getFreePosition(model);
		if (!position) return mp.events.reject('Nema slobodnih mesta na parkingu');

		const vehicleModel = this.models.find((item) => (typeof item === 'object' ? item.name : item) === model);

		if (!vehicleModel) return mp.events.reject('Vozilo nije pronadjeno');

		if (this.vehicles.has(vehicleModel.dbId)) return mp.events.reject('Vozilo je već stvoreno');

		const builder = new Builder(
			typeof vehicleModel === 'object' ? vehicleModel.model : vehicleModel,
			position,
			position.rot,
			player.mp.dimension
		);

		const tuning = {
			...this.tuning,
			...((typeof vehicleModel === 'object' && vehicleModel?.tuning) || {}),
		};

		builder.setNumberPlate(vehicleModel.govNumber || this.getNumberPlate(player.faction));

		builder.installTuning(tuning);
		builder.setOwner(player.dbId, player.faction);

		const vehicle = builder.build();
		mp.vehicles.authorize(vehicle, vehicleModel?.dbId);

		this.vehicles.set(vehicle.dbId, vehicle);
	}

	despawnVehicle(vehicle: VehicleMp) {
		if (vehicle) {
			if (this.spawnOnInit) {
				const position: Position = vehicle.getVariable('spawnPosition');

				vehicle.getOccupants().forEach((player) => player.removeFromVehicle());

				if (!position) return;

				vehicle.engine = false;
				vehicle.position = new mp.Vector3(position.x, position.y, position.z);
				vehicle.rotation = new mp.Vector3(0, 0, position.rot);

				return;
			}

			this.vehicles.delete(vehicle.dbId);
			mp.vehicles.delete(vehicle);
		}
	}

	private getNumberPlate(faction: string) {
		const vehiclesAmount = this.vehicles.size + 1;

		return faction.slice(0, 4).toUpperCase() + vehiclesAmount;
	}

	private getFreePosition(model: string) {
		const vehiclesItem = this.models.find((item) => (typeof item === 'object' ? item.name : item) === model);
		const vehicleModel = typeof vehiclesItem === 'object' ? vehiclesItem.model : model;

		const vehicleType: string = vehicles[vehicleModel]?.type;
		const positions: Position[] = this.positions[vehicleType] ?? this.positions.all;

		const position =
			positions &&
			positions.find((item) => {
				const vehicle = getClosestVehicleInRange(new mp.Vector3(item.x, item.y, item.z), 2);

				return !vehicle;
			});

		return position;
	}
}

export default FactionGarage;
