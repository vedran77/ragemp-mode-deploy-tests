import rpc from 'rage-rpc';
import hud from 'helpers/hud';
import { locations } from './data';
import './sell';
import moment from 'moment';

type BlackMarketLocation = {
	position: Vector3Mp;
	lastSeen: number;
};

const interval = 30 * 60 * 1000;

class BlackMarket {
	private ped: BlackMarketLocation | null = null;

	constructor() {
		mp.events.subscribe(
			{
				'BlackMarket-Call': this.callFromPlayer.bind(this),
				'BlackMarket-Location': this.getPedLocation.bind(this),
			},
			false
		);

		this.init();
	}

	private async callFromPlayer(player: Player) {
		if (this.ped.lastSeen + 2 * interval > Date.now() && this.ped.lastSeen + interval < Date.now()) {
			hud.showNotification(
				player,
				'info',
				`Čovek sa crnog tržišta će biti na novoj lokaciji u ${moment(this.ped.lastSeen + 2 * interval).format(
					'HH:mm'
				)}, pozovi ga tad da proveriš gde je!`,
				true
			);

			return;
		}

		if (this.ped.lastSeen <= Date.now() && this.ped.lastSeen + interval > Date.now()) {
			hud.showNotification(
				player,
				'info',
				'James, je već na ovoj lokaciji, potraži ga u označenom okrugu!',
				true
			);
			await rpc.callClient(player.mp, 'LocationArea-Create', ['bm11332', this.ped.position, 72]);

			return;
		}

		const location = this.setPedNewLocation();

		hud.showNotification(
			player,
			'info',
			'James, je spreman i čeka te na lokaciji, potraži ga u označenom okrugu!',
			true
		);
		await rpc.callClient(player.mp, 'LocationArea-Create', [
			'bm11332',
			new mp.Vector3(location.x, location.y, location.z),
			72,
		]);

		return new mp.Vector3(location.x, location.y, location.z);
	}

	private getPedLocation() {
		return this.ped.position;
	}

	init() {
		this.setPedNewLocation();

		setInterval(() => {
			this.setPedNewLocation();
		}, 2 * interval);
	}

	private setPedNewLocation() {
		let location = null;

		if (!this?.ped?.position) {
			location = locations[Math.floor(Math.random() * locations.length)];
		} else {
			const availableLocations = locations.filter(
				(item) =>
					item.x !== this.ped.position.x && item.y !== this.ped.position.y && item.z !== this.ped.position.z
			);
			location = availableLocations[Math.floor(Math.random() * availableLocations.length)];
		}

		this.ped = {
			position: new mp.Vector3(location.x, location.y, location.z),
			lastSeen: Date.now(),
		};

		mp.players.toCustomArray().forEach((player) => {
			player.callEvent('BlackMarket-NewLocation', new mp.Vector3(location.x, location.y, location.z), false);
		});

		return location;
	}
}

export default new BlackMarket();
