import { sortBy } from 'lodash';
import rpc from 'rage-rpc';
import { finishWork } from 'jobs';
import animations from 'helpers/animations';
import prison from 'basic/prison';
import hospitals from 'data/hospitals.json';
import ems from 'factions/lsfd';
import emsCalls from 'factions/lsfd/calls';
import cuffsActions from 'factions/actions/cuffs';
import bagActions from 'factions/actions/bag';
import hunger from './hunger';
import inventory from './inventory';

class PlayerDeath {
	private deathTimeout: number;

	constructor() {
		this.deathTimeout = 5 * 60 * 1000;

		mp.events.subscribeToDefault({ playerDeath: this.onDeath.bind(this) });

		mp.events.subscribe({
			'Player-Die': this.death.bind(this),
		});
	}

	ressurect(player: Player) {
		emsCalls.cancelCall(player.dbId);

		player.dead = false;
		player.mp.health = 50;
		animations.stopOnServer(player.mp);
	}

	private async onDeath(player: Player, reason: number, killer?: PlayerMp) {
		// Notify all admins about the death
		const admins = mp.players.toCustomArray().filter((p) => p.adminLvl > 0 && p.mp.getVariable('ADUTY'));

		admins.forEach((admin) => {
			rpc.callBrowsers(admin.mp, 'HUD-UpdateDeathLog', [
				[
					{
						target: `${player.mp.name} (${player.mp.id})`,
						killer: killer ? `${killer.name} (${killer.id})` : null,
						weapon: reason,
					},
				],
			]);
		});

		if (player.dead || player.mp.dimension > 0 || prison.isImprisoned(player)) {
			return this.death(player);
		}

		bagActions.reset(player);

		player.mp.spawn(player.mp.position);
		player.mp.health = 100;

		animations.stopScenario(player);
		animations.playOnServer(player.mp, 'dead');

		await player.callEvent('Player-ShowDeathMenu', [this.deathTimeout, ems.getPlayers(true).length], true);

		player.dead = true;
	}

	private async death(player: Player) {
		cuffsActions.reset(player);

		finishWork(player);
		await inventory.clear(player);
		hunger.reset(player);

		this.ressurect(player);
		this.respawn(player);

		player.mp.health = 20;
	}

	private respawn(player: Player) {
		if (prison.isImprisoned(player)) {
			prison.putToRandomCell(player);
			return;
		}

		const hospital = this.getClosestHospital(player.mp);

		player.mp.spawn(new mp.Vector3(hospital.x, hospital.y, hospital.z));
		player.mp.dimension = 0;
	}

	private getClosestHospital(player: PlayerMp) {
		return sortBy(hospitals, ({ x, y, z }) => player.dist(new mp.Vector3(x, y, z)))[0];
	}
}

export default new PlayerDeath();
