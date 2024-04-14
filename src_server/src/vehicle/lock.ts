import { getClosestVehicleInRange } from 'utils/vehicle';
import hud from 'helpers/hud';
import animations from 'helpers/animations';
import tasks from 'awards/tasks';
import policeCalls from 'factions/police/calls';
import vehState from './state';
import owning from './owning';

class VehicleLock {
	constructor() {
		mp.events.subscribe({
			'Vehicle-ToggleLock': this.toggle.bind(this),
			'Vehicle-OpenLock': this.open.bind(this),
			'Vehicle-TriggerAlarm': this.triggerAlarm,
		});
	}

	toggle(player: Player, vehicle: VehicleMp) {
		if (!vehicle) return;

		if (!owning.isOwner(vehicle, player) && !player.mp.getVariable('ADUTY')) {
			return hud.showNotification(player, 'error', 'Nemate ključeve vozila');
		}

		const { locked } = vehState.get(vehicle);

		vehState.setLockStatus(vehicle, !locked);

		if (!player.mp.vehicle) {
			animations.setScenario(player, 'lock_vehicle', true);
		}

		hud.showNotification(player, 'info', locked ? 'Otključali se vozilo' : 'Zaključali se vozilo');
	}

	async pick(player: Player, lockpick: InventoryItem) {
		const vehicle = getClosestVehicleInRange(player.mp.position, 3);
		const state = vehState.get(vehicle as any);

		if (!state.locked) throw new SilentError('vehicle is not closed');

		lockpick.amount -= 1;
		animations.setScenario(player, 'veh_lockpick');

		player.callEvent('Lockpick-ShowMenu', [
			vehicle,
			{
				onSuccess: 'Vehicle-OpenLock',
				onError: 'Vehicle-TriggerAlarm',
			},
		]);
	}

	private async open(player: Player, vehicle: VehicleMp) {
		if (!vehicle) return;

		vehState.setLockStatus(vehicle, false);
		mp.events.call('playerUnlockVehicle', player.mp, vehicle);

		await tasks.implement(player, 'theft_veh');
		hud.showNotification(player, 'info', 'Otključali se vozilo');
	}

	private triggerAlarm(player: Player, vehicle: VehicleMp) {
		if (!vehicle) return;

		mp.players
			.getByDbId(vehicle.owner.player)
			.mp.outputChatBox(`!{95e800}[VOZILO]: !{ffffff}Aktivirao se alarm na tvom vozilu (${vehicle.name})!`);

		policeCalls.createCallout(
			player,
			{
				id: 't' + vehicle.id,
				message: `Priavljena je krađa vozila (${vehicle.name}), registarska oznaka vozila: ${vehicle.numberPlate}`,
				position: vehicle.position,
			},
			false
		);
	}
}

export default new VehicleLock();
