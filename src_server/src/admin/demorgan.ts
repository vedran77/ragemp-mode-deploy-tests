import moment from 'moment';
import chat from 'basic/chat';
import prison from 'basic/prison';
import permissions from './permissions';
import journal from './journal';
import { chatErrorMessages } from 'helpers/commands';

class AdminDemorgan {
	constructor() {
		mp.events.subscribe({
			'Admin-ToDemorgan': this.toDemorgan.bind(this),
			'Admin-ReleaseDemorgan': this.releasePlayer.bind(this),
		});
	}

	private async toDemorgan(
		admin: Player,
		userId: string,
		term: string,
		reason: string
	) {
		if (
			!permissions.hasPermission(admin, 'jadmin') ||
			!admin.mp.getVariable('ADUTY')
		) {
			admin.mp.outputChatBox(
				chatErrorMessages.error(
					'Nemate dozvolu za ovu komandu ili niste na admin duznost!'
				)
			);
			return;
		}

		const minutes = this.getMinutesAmount(term);

		if (minutes > 4 * 60 && !permissions.hasPermission(admin, 'manager')) {
			return mp.events.reject('Maksimalno vreme - 4 sata');
		}

		const target = mp.players.getByDbId(userId);

		if (target) {
			await prison.imprisonPlayer(target, minutes, reason, true);

			journal.recordAction(
				admin,
				'demorgan',
				`${target.getName()} | ${reason} | ${minutes}min`,
				userId
			);
			chat.sendSystem(
				`${admin.getName()} je zatvorio igrača ${target.getName()} zbog (${reason})`
			);
		}
	}

	private releasePlayer(admin: Player, userId: string) {
		if (
			!permissions.hasPermission(admin, 'manager') ||
			!admin.mp.getVariable('ADUTY')
		) {
			return mp.events.reject('Nisi autorizovan za ovu radnju!');
		}

		const target = mp.players.getByDbId(userId);

		if (target && prison.isImprisoned(target)) {
			prison.releasePlayer(target);

			journal.recordAction(
				admin,
				'prison_release',
				target.getName(),
				userId
			);
		}
	}

	private getMinutesAmount(date: string) {
		return moment(date).diff(moment(), 'minutes');
	}
}

const demorgan = new AdminDemorgan();
