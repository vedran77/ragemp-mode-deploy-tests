import { chatErrorMessages } from 'helpers/commands';
import permissions from './permissions';
import GangZonesModel from 'models/GangZone';
import gangZone from 'factions/gangs/zones';
import captureZone from 'factions/wars/capture';
import journal from './journal';
import factions from 'factions';

class GangZones {
	constructor() {
		mp.events.addCommands({
			makezone: this.makeZone.bind(this),
			deletezone: this.deleteZone.bind(this),
			zauzmi: this.captureZone.bind(this),
		});
	}

	private async captureZone(player: Player) {
		if (!player.faction) {
			player.mp.outputChatBox(
				chatErrorMessages.info('Morate biti u bandi/mafiji!')
			);
			return;
		}

		const factionData = factions.getFaction(player.faction);

		if (!factionData || factionData.type !== 'gang') {
			player.mp.outputChatBox(
				chatErrorMessages.info('Morate biti clan bande!')
			);
			return;
		}

		await captureZone.startWar(player);
	}

	private async makeZone(admin: Player, radius: number = 50) {
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

		const pos = admin.mp.position;

		const newZone = await GangZonesModel.create({
			position: pos,
			radius,
		});

		gangZone.createZone(newZone, true);

		journal.recordAction(
			admin,
			'gang-zone-create',
			`je kreira zonu na poziciji ${pos.x}, ${pos.y}, ${pos.z}`
		);
	}

	private async deleteZone(admin: Player) {
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

		const pos = admin.mp.position;
		const zone = gangZone.getNearestZone(pos);

		if (!zone) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nema zone na ovoj lokaciji!')
			);
			return;
		}

		gangZone.deleteZone(zone.id);

		await GangZonesModel.deleteOne({ _id: zone.id });
	}
}

export default new GangZones();
