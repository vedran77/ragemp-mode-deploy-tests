import rpc from 'rage-rpc';
import chat from 'basic/chat';
import factions, { Faction } from 'factions';
import zones from '../../gangs/zones';
import Capture from './strategy';
import hud from 'helpers/hud';
import { chatErrorMessages } from 'helpers/commands';
import moment from 'moment';

const config = {
	time: 780,
};

class ZoneCapture {
	private time: number;
	private current?: Capture;
	private captureTimer?: NodeJS.Timeout;

	constructor() {
		this.time = config.time;

		mp.events.subscribeToDefault({
			playerDeath: this.onPlayerDeath.bind(this),
		});

		mp.events.subscribe({
			'ZoneCapture-StartWar': this.startWar.bind(this),
		});
	}

	async startWar(player: Player) {
		const zone = zones.getNearestZone(player.mp.position);

		if (!zone)
			return hud.showNotification(
				player,
				'error',
				'Niste na naznačenom mesto da bi zauzeli teritoriji',
				true
			);

		if (moment().isBefore(moment(zone.capturedAt).add(2, 'hours'))) {
			hud.showNotification(
				player,
				'error',
				'Nedavno je zauzeta teritorija, probajte kasnije da bi ste zauzeli teritoriju',
				true
			);
			return;
		}

		const owner = factions.getFaction(zone.owner);

		const error = this.checkCanStart(player, owner);

		if (error) {
			hud.showNotification(player, 'error', error, true);
			return;
		}

		if (!zone.owner) {
			await zones.setOwner(zone, player.faction);
			return;
		}

		this.current = new Capture(zone, player.faction);

		this.time = config.time;
		this.captureTimer = setInterval(this.updateTimer.bind(this), 1000);

		zone.status = true;
		zones.updateZoneBlip(zone);

		mp.players
			.toCustomArray()
			.filter(
				(p) => p.faction === zone.owner || p.faction === player.faction
			)
			.forEach((player) => {
				player.callEvent('GangCapture-Start', [
					this.time,
					this.current.attacker.id,
					this.current.defender.id,
				]);
			});

		chat.sendToFaction(
			owner,
			chatErrorMessages.custom(
				'ZONE-INFO',
				`PAŽNJA! Vaša teritorija je napadnuta`
			)
		);
	}

	async endWar(captured = false) {
		const { zone, attacker, defender } = this.current;

		this.showDeathLog();

		clearInterval(this.captureTimer);
		this.current.reset();
		this.current = null;

		await zones.setOwner(zone, captured ? attacker.id : defender.id);

		// Notify players
		const attackerFaction = factions.getFaction(attacker?.id);
		const defenderFaction = factions.getFaction(defender?.id);

		chat.sendToFaction(
			attackerFaction,
			chatErrorMessages.custom(
				'ZONE-INFO',
				captured
					? `Vreme je isteklo i uspešno ste zauzeli zonu!`
					: `Vreme je isteklo i niste uspeli da zauzmete zonu!`
			)
		);
		chat.sendToFaction(
			defenderFaction,
			chatErrorMessages.custom(
				'ZONE-INFO',
				captured
					? `Vreme je isteklo i niste uspeli da odbranite zonu!`
					: `Vreme je isteklo, uspeli ste da odbranite zonu!`
			)
		);

		mp.players
			.toCustomArray()
			.filter(
				(p) => p.faction === defender.id || p.faction === attacker.id
			)
			.forEach((player) => {
				player.mp.setOwnVariable('inCaptureZone', false);
				player.callEvent('GangCapture-Stop');
			});
	}

	private async updateTimer() {
		const { attacker, defender } = this.current;

		this.time -= 1;
		if (this.time <= 0) return this.endWar(defender.alive < attacker.alive);
	}

	private onPlayerDeath(player: Player, reason: string, killer: PlayerMp) {
		if (!this.current) return;

		this.showDeathLog(player, killer, reason);
	}

	private checkCanStart(player: Player, defender: Faction) {
		const gang = factions.getFaction(player.faction);

		if (this.current || !gang) {
			return 'Niste u bandi ili već napadate teritoriju';
		}
		if (gang.name === defender?.name) {
			return 'Ne možete napasti svoju teritoriju';
		}
		// if (gang.getPlayers(true).length < 5) {
		// 	return 'Nemate dovoljno članova za napad';
		// }
		// if (defender.getPlayers(true).length < 5) {
		// 	return 'Suparnička banda nema dovoljno članova da bi ste napali';
		// }
	}

	private showDeathLog(player?: Player, killer?: PlayerMp, reason?: string) {
		const playersInZone = [
			...(this.current?.attacker?.members || []),
			...(this.current?.defender?.members || []),
		];

		playersInZone.forEach((dbId) => {
			const playerInZone = mp.players.getByDbId(dbId);

			if (playerInZone.mp.getVariable('ADUTY') || !playerInZone) return;

			rpc.callBrowsers(
				playerInZone.mp,
				'HUD-UpdateDeathLog',
				player
					? [
							[
								{
									target: `${player.mp.name} (${player.mp.id})`,
									killer: killer
										? `${killer.name} (${killer.id})`
										: null,
									weapon: reason,
								},
							],
					  ]
					: null
			);
		});
	}
}

export default new ZoneCapture();
