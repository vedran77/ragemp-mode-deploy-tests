import vehicleControls from 'vehicle/controls';
import { Action } from './index';

const localPlayer = mp.players.local;

class VehicleTarget {
	callAction(target: VehicleMp, action: Action) {
		const vehicle = (target?.type === 'vehicle' ? target : localPlayer.vehicle) as VehicleMp;

		if (!vehicle) return;

		const { group, id } = action;

		switch (group) {
			case 'doors':
				vehicleControls.toggleDoor(vehicle, id.toUpperCase() as any);
				break;
			case 'passengers':
				if (localPlayer.vehicle.handle !== vehicle.handle) {
					return mp.game.ui.notifications.show('error', 'Moraš biti vozač', true);
				}

				mp.events.callServer('Vehicle-KickPassenger', [vehicle, parseInt(id, 10)]);
				break;
			case 'trunk':
				if (id === 'inventory') {
					const { min } = mp.game.gameplay.getModelDimensions(vehicle.model);
					const vehPosition = vehicle.getOffsetFromInWorldCoords(0, min.y - 1, 0);

					const dist = mp.game.system.vdist(
						localPlayer.position.x,
						localPlayer.position.y,
						localPlayer.position.z,
						vehPosition.x,
						vehPosition.y,
						vehPosition.z
					);

					if (dist > 1.5 && !localPlayer.vehicle)
						return mp.game.ui.notifications.show('error', 'Moraš biti kod gepeka ili u vozilu!', true);

					mp.events.callServer('Inventory-ShowVehicleMenu');
				} else if (id === 'access') mp.events.callServer('Vehicle-ToggleTrunk', vehicle, false);
				break;
			default:
				if (id === 'lock') vehicleControls.toggleLockStatus(vehicle);
				else if (id === 'seatbelt') vehicleControls.toggleSeatBelt();
				else if (id === 'refuel') mp.events.callServer('Vehicle-Refuel', vehicle, false);
				else if (id === 'repair') mp.events.callServer('Vehicle-Repair', vehicle, false);
				else if (id === 'park') mp.events.callServer('Vehicle-Park', vehicle, false);

				break;
		}
	}
}

export default new VehicleTarget();
