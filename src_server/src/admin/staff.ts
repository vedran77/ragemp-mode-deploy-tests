import UserModel from 'models/User';
import { chatErrorMessages } from 'helpers/commands';
import permissions, { AdminLevels } from './permissions';

class Staff {
	constructor() {
		mp.events.addCommands({
			makeadmin: this.setAdminLevel,
		});
	}

	private async setAdminLevel(admin: Player, data: any) {
		if (!permissions.hasPermission(admin, 'hadmin')) {
			return admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu!')
			);
		}

		const args = data?.split(' ');

		if (!args || args.length < 2) {
			return admin.mp.outputChatBox(
				chatErrorMessages.error('/makeadm [ID] [LEVEL]')
			);
		}

		const target = args[0] * 1;
		const level = args[1] * 1;

		const isValidLevel = Object.keys(AdminLevels);

		if (
			isValidLevel[isValidLevel.length - 1]?.length < level ||
			(admin.adminLvl === AdminLevels.hadmin.level &&
				level > AdminLevels.hadmin.level)
		) {
			return admin.mp.outputChatBox(
				chatErrorMessages.error('Nije dobar admin level!')
			);
		}

		const player = mp.players.get(target);

		if (!player) {
			return admin.mp.outputChatBox(
				chatErrorMessages.error('Igrač nije na serveru!')
			);
		}

		if (admin.dbId === player.dbId) {
			return admin.mp.outputChatBox(
				chatErrorMessages.error('Ne možete sami sebi promeniti nivo!')
			);
		}

		player.adminLvl = level;
		player.mp.setVariable('adminLvl', level);

		await UserModel.findByIdAndUpdate(player.account, {
			$set: { adminLvl: level },
		});
	}
}

export default new Staff();
