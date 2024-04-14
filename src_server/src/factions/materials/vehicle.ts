import animations from 'helpers/animations';
import attachments from 'helpers/attachments';
import { chatErrorMessages } from 'helpers/commands';
import hud from 'helpers/hud';
import { ClientError } from 'utils/errors';

class VehicleMaterials {
	private capacity: { [name: string]: number };

	constructor() {
		this.capacity = {
			titan: 50000,
			barracks: 10000,
			burrito3: 5000,
			sheriffrumpo: 5000,
			polspeedo: 5000,
			lsfd3: 5000,
		};

		mp.events.subscribe({
			'VehicleMaterials-HandleCargo': this.handleCargo.bind(this),
		});

		mp.events.subscribeToDefault({
			playerEnterVehicle: this.onEnterVehicle.bind(this),
			playerExitVehicle: this.onExitVehicle.bind(this),
		});
	}

	private onEnterVehicle(player: Player, vehicle: VehicleMp) {
		if (this.capacity[vehicle.name]) {
			this.hideCargoPoint(player, vehicle);
		}
	}

	private onExitVehicle(player: Player, vehicle: VehicleMp) {
		if (this.capacity[vehicle.name] && this.getMaterials(vehicle) > 0) {
			this.showCargoPoint(player, vehicle);

			mp.players.forEachInRange(player.mp.position, 500, (sPlayer) => {
				if (!sPlayer.isStreamed(player.mp)) return;

				const dbPlayer = mp.players.get(sPlayer.id);
				this.showCargoPoint(dbPlayer, vehicle);
			});
		}
	}

	private playerHasBox(player: PlayerMp) {
		return attachments.has(player, 'card_box');
	}

	getCapacity(vehicle: VehicleMp) {
		return this.capacity[vehicle.name] ?? 0;
	}

	getMaterials(vehicle: VehicleMp) {
		return (vehicle?.getVariable('materials') as number) ?? 0;
	}

	private async addCargoToVehicle(player: Player, vehicle: VehicleMp) {
		const materials = this.getMaterials(vehicle);
		const capacity = this.getCapacity(vehicle);

		if (materials >= capacity) {
			hud.showNotification(player, 'info', 'Vozilo je puno!');
			return;
		}

		vehicle.setVariable('materials', materials + 250);

		await this.animPlayer(player, false);

		player.mp.outputChatBox(
			chatErrorMessages.custom(
				'WAR-INFO',
				`Ostavili ste kutiju u vozilo, trenutno ima ${(materials + 250) / 250}/${capacity / 250}`
			)
		);

		if (materials + 250 >= capacity) this.hideCargoPoint(player, vehicle);
	}

	private async getCargoFromVehicle(player: Player, vehicle: VehicleMp) {
		if (player.mp.vehicle) return;

		const materials = this.getMaterials(vehicle);
		const capacity = this.getCapacity(vehicle);

		if (materials === 0) {
			hud.showNotification(player, 'info', 'Nemate kutija u vozilu!');
			return;
		}

		vehicle.setVariable('materials', materials - 250);

		await this.animPlayer(player, true);

		player.mp.outputChatBox(
			chatErrorMessages.custom(
				'WAR-INFO',
				`Uzeli ste kutiju iz vozila, trenutno ima ${(materials - 250) / 250}/${capacity / 250}`
			)
		);

		this.vehiclesInStream(player);

		if (materials - 250 >= capacity || materials - 250 <= 0) {
			this.hideCargoPoint(player, vehicle);
		}
	}

	private handleCargo(player: Player, vehicle: VehicleMp) {
		if (!vehicle) return;

		if (this.playerHasBox(player.mp)) {
			this.addCargoToVehicle(player, vehicle);
		} else {
			this.getCargoFromVehicle(player, vehicle);
		}
	}

	async getCargo(player: Player): Promise<void | ClientError> {
		if (player.mp.vehicle) throw new ClientError('Niste u mogućnosti uzeti kutiju');

		if (this.playerHasBox(player.mp)) {
			await this.animPlayer(player, false);

			return;
		}

		const nearVehicle = mp.vehicles.toArray().find((vehicle) => {
			return (
				vehicle.isStreamed(player.mp) &&
				vehicle.getOccupants().length === 0 &&
				this.getCapacity(vehicle) > 0 &&
				this.getMaterials(vehicle) < this.getCapacity(vehicle)
			);
		});

		if (!nearVehicle) throw new ClientError('Nema vozila u blizini');

		await this.animPlayer(player, true);

		this.vehiclesInStream(player);
	}

	vehiclesInStream(player: Player) {
		mp.vehicles.forEach((vehicle) => {
			const materials = this.getMaterials(vehicle);
			const capacity = this.getCapacity(vehicle);
			const hasDriver = vehicle.getOccupants().some((p) => p.seat === 0);

			if (
				vehicle.isStreamed(player.mp) &&
				this.playerHasBox(player.mp) &&
				!hasDriver &&
				capacity > 0 &&
				materials < capacity
			) {
				this.showCargoPoint(player, vehicle);
			}
		});
	}

	private showCargoPoint(player: Player, vehicle: VehicleMp) {
		player.callEvent('Cargo-ShowVehiclePoint', [vehicle, 'VehicleMaterials-HandleCargo']);
	}

	private hideCargoPoint(player: Player, vehicle: VehicleMp) {
		const hidePoint = (p: Player) => p.callEvent('Cargo-RemoveVehiclePoint', vehicle);

		hidePoint(player);
		mp.players.forEachInRange(player.mp.position, 500, (sPlayer) => {
			if (!sPlayer.isStreamed(player.mp)) return;

			const dbPlayer = mp.players.get(sPlayer.id);
			hidePoint(dbPlayer);
		});
	}

	private async animPlayer(player: Player, take = false, stop = false): Promise<void> {
		return new Promise((resolve) => {
			if (take) {
				animations.playOnServer(player.mp, 'pickup_box_full');
			} else {
				animations.playOnServer(player.mp, 'pickup_box');
			}

			setTimeout(() => {
				if (take) {
					animations.playOnServer(player.mp, 'hold_box');
					attachments.add(player.mp, 'card_box');
				} else {
					attachments.remove(player.mp, 'card_box');
					animations.stopOnServer(player.mp);
				}

				resolve();
			}, 1000);
		});
	}
}

export default new VehicleMaterials();
