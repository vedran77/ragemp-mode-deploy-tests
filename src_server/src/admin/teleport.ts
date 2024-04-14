import { chatErrorMessages } from 'helpers/commands';
import permissions from './permissions';

class Teleport {
	constructor() {
		mp.events.addCommands({
			goto: this.toPlayer.bind(this),
			gethere: this.toYourself.bind(this),
			gotowp: this.toWaypoint.bind(this),
			gotocords: this.toCords.bind(this),
		});
	}

	toPlayer(admin: Player, target: number) {
		if (
			!permissions.hasPermission(admin, 'admin') ||
			!admin.mp.getVariable('ADUTY')
		) {
			admin.mp.outputChatBox(
				chatErrorMessages.error(
					'Nemate dozvolu za ovu komandu ili niste na admin duznost!'
				)
			);
			return;
		}

		if (!target) {
			admin.mp.outputChatBox(chatErrorMessages.error('/goto [id]'));
			return;
		}

		const player = mp.players.at(target);

		if (!player) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Igrač nije online')
			);
			return;
		}

		if (admin.mp.id === player.id) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Taj igrač je debil!')
			);
			return;
		}

		if (!player) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Igrač nije online')
			);
			return;
		}

		admin.tp(player.position, player.heading, player.dimension, true);
	}

	toYourself(admin: Player, target: number) {
		if (
			!permissions.hasPermission(admin, 'admin') ||
			!admin.mp.getVariable('ADUTY')
		) {
			admin.mp.outputChatBox(
				chatErrorMessages.error(
					'Nemate dozvolu za ovu komandu ili niste na admin duznost!'
				)
			);
			return;
		}

		if (!target) {
			admin.mp.outputChatBox(chatErrorMessages.error('/goto [id]'));
			return;
		}

		const player = mp.players.at(target);

		if (!player) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Igrač nije online')
			);
			return;
		}

		if (admin.mp.id === player.id) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Taj igrač je debil!')
			);
			return;
		}

		if (!player) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Igrač nije online')
			);
			return;
		}

		const playerData = mp.players.get(player);
		const { position, heading, dimension } = admin.mp;

		playerData.tp(position, heading, dimension, true);
	}

	toWaypoint(admin: Player) {
		if (
			!permissions.hasPermission(admin, 'admin') ||
			!admin.mp.getVariable('ADUTY')
		) {
			admin.mp.outputChatBox(
				chatErrorMessages.error(
					'Nemate dozvolu za ovu komandu ili niste na admin duznost!'
				)
			);
			return;
		}

		if (!admin.waypoint) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nisi postavio waypoint.')
			);
			return;
		}

		admin.tp(admin.waypoint, admin.mp.heading, admin.mp.dimension, true);
	}

	toCords(admin: Player, data: string) {
		if (
			!permissions.hasPermission(admin, 'admin') ||
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

		if (!args || args.length !== 3) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('/gotocords [x] [y] [z]')
			);
			return;
		}

		const [x, y, z] = args.map(Number);

		admin.tp({ x, y, z }, admin.mp.heading, admin.mp.dimension, true);
	}
}

export default new Teleport();
