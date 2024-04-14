import factions from 'factions';
import gangZones from 'factions/gangs/zones';
import fortWar from 'factions/wars/fort';
import permissions from './permissions';
import { chatErrorMessages } from 'helpers/commands';

class AdminFaction {
	constructor() {
		mp.events.addCommands({
			makeleader: this.setLeader,
			startfortwar: this.startFortWar,
			setzoneowner: this.setZoneOwner,
		});
	}

	private async setLeader(admin: Player, data: any) {
		if (
			!permissions.hasPermission(admin, 'manager') ||
			!admin.mp.getVariable('ADUTY')
		) {
			admin.mp.outputChatBox(
				chatErrorMessages.error(
					'Nemate dozvolu za ovu komandu ili niste na admin duznost!'
				)
			);
			return;
		}

		const args = data?.split(' ');

		if (!args || args.length < 2) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('/makeleader [ID] [FACTION]')
			);

			const factionsList = Array.from(factions.getFactions()).join(', ');
			admin.mp.outputChatBox(
				chatErrorMessages.info('none, ' + factionsList)
			);
			return;
		}

		const [target, factionName] = args;

		const player = mp.players.at(target * 1);

		if (!player) {
			return admin.mp.outputChatBox(
				chatErrorMessages.error('Igrač nije na serveru!')
			);
		}

		const playerData = mp.players.get(player);

		if (playerData.faction) {
			const faction = factions.getFaction(playerData.faction);

			if (faction) {
				faction.finishWork(playerData);
				await faction.members.delete(playerData.dbId);
				factions.loadForPlayer(playerData, faction);
			}
		}

		if (factionName === 'none') return;

		const faction = factions.getFaction(factionName);

		if (faction) {
			const rank = Array.from(faction.ranks.items.keys()).find((item) =>
				faction.ranks.hasPermission(item, 'leader')
			);

			await faction.members.add(playerData, rank);
			factions.loadForPlayer(playerData, faction);
		}
	}

	private startFortWar(admin: Player) {
		if (
			!permissions.hasPermission(admin, 'manager') ||
			!admin.mp.getVariable('ADUTY')
		) {
			admin.mp.outputChatBox(
				chatErrorMessages.error(
					'Nemate dozvolu za ovu komandu ili niste na admin duznost!'
				)
			);
			return;
		}

		fortWar.start();
	}

	private setZoneOwner(admin: Player, owner: number) {
		if (
			!permissions.hasPermission(admin, 'manager') ||
			!admin.mp.getVariable('ADUTY')
		) {
			admin.mp.outputChatBox(
				chatErrorMessages.error(
					'Nemate dozvolu za ovu komandu ili niste na admin duznost!'
				)
			);
			return;
		}

		if (!owner) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('/setzoneowner [ID]')
			);
			return;
		}

		const player = mp.players.at(owner);

		if (!player) {
			return admin.mp.outputChatBox(
				chatErrorMessages.error('Igrač nije na serveru!')
			);
		}

		const playerData = mp.players.get(player);

		if (!playerData.faction) {
			return admin.mp.outputChatBox(
				chatErrorMessages.error('Igrač nije u organizaciji!')
			);
		}

		if (!admin.waypoint) {
			return admin.mp.outputChatBox(
				chatErrorMessages.error('Oznaci GANG ZONU na mapi!')
			);
		}

		const zone = gangZones.getNearestZone(admin.waypoint);
		if (zone) gangZones.setOwner(zone, playerData.faction);
	}
}

const admFaction = new AdminFaction();
