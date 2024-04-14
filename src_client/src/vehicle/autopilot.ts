import waypoint from 'basic/waypoint';

const player = mp.players.local;

const availableVehicles = ['raidenz'];

class Autopilot {
	private activated = false;

	private colshape?: ColshapeMp;

	private point?: Vector3Mp;

	constructor() {
		mp.events.subscribeToDefault({
			playerEnterColshape: this.onEnterColshape.bind(this),
			playerCreateWaypoint: this.onCreatePoint.bind(this),
			playerLeaveVehicle: (vehicle: VehicleMp) => this.isActivated && this.stop(vehicle),
			render: this.toggle.bind(this),
		});
	}

	get isActivated() {
		return this.activated;
	}

	toggle() {
		if (!mp.keys.isDown(0x09) || !this.isAvailableVehicle(player.vehicle)) return;

		const { vehicle } = player;

		if (!vehicle) {
			return mp.game.ui.notifications.show('error', 'Morate biti u vozilu');
		}

		if (this.isActivated) this.stop(vehicle);
		else this.start(vehicle);
	}

	private isAvailableVehicle(vehicle: VehicleMp) {
		const name = mp.game.vehicle.getDisplayNameFromVehicleModel(vehicle.model);

		return availableVehicles.includes(name);
	}

	private start(vehicle: VehicleMp) {
		if (!waypoint.isActive()) {
			return mp.game.ui.notifications.show('error', 'Morate postaviti oznaku na mapi');
		}

		this.setPosition(vehicle, waypoint.currentPosition);

		this.activated = true;

		mp.game.ui.notifications.show('info', 'Autopilot je uključen');
	}

	private stop(vehicle: VehicleMp) {
		player.clearTasks();
		player.taskVehicleTempAction(vehicle.handle, 27, 10000);

		this.deleteDestinationColshape();

		this.activated = false;

		mp.game.ui.notifications.show('info', 'Autopilot je isključen');
	}

	private setPosition(vehicle: VehicleMp, position: Vector3Mp) {
		this.point = position;

		this.setVehicleTask(vehicle);
		this.createDestinationColshape();
	}

	private setVehicleTask(vehicle: VehicleMp) {
		player.taskVehicleDriveToCoord(
			vehicle.handle,
			this.point.x,
			this.point.y,
			this.point.z,
			53,
			1,
			1,
			2883621,
			30,
			1
		);
	}

	private createDestinationColshape() {
		if (this.colshape) this.deleteDestinationColshape();

		this.colshape = mp.colshapes.newCircle(this.point.x, this.point.y, 40);
	}

	private deleteDestinationColshape() {
		this.colshape.destroy();

		this.colshape = null;
	}

	private onEnterColshape(shape: ColshapeMp) {
		if (shape === this.colshape && player.vehicle) this.stop(player.vehicle);
	}

	private onCreatePoint(position: Vector3Mp) {
		if (!this.isActivated && !player.vehicle) return;

		this.setPosition(player.vehicle, position);
	}
}

export default new Autopilot();
