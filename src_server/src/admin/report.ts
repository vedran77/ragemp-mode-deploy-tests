import moment from 'moment';
import CharModel from 'models/Character';
import permissions from './permissions';
import { colors } from 'basic/chat/commands';
import players from 'helpers/players';
import hud from 'helpers/hud';

type ReportObj = {
	sender: string;
	message: string;
	timestamp?: string;
};

let iReport = 1;

class Report {
	private reports: Map<number, ReportObj>;

	constructor() {
		this.reports = new Map();

		mp.events.addCommand({
			report: (entity, message) => {
				const player = mp.players.get(entity);
				this.create(player, message);
			},
			areport: (entity, reportId) => {
				const player = mp.players.get(entity);
				this.accept(player, Number(reportId));
			},
			areports: (entity, sPage) => {
				const player = mp.players.get(entity);
				this.showAdminsReports(player, Number(sPage));
			},
		});
	}

	create(player: Player, message: string) {
		if (!message || message.length < 3 || message.length > 150) {
			player.mp.outputChatBox(`!{95e800}[GREŠKA]: !{${colors.white}}/report [message]`);
			return;
		}

		const isReported = this.isReported(player.dbId);

		if (isReported) {
			hud.showNotification(
				player,
				'error',
				'Potrebno je da sačekate 2 minuta pre nego što pošaljete novu prijavu.',
				true
			);

			return;
		}

		this.reports.set(iReport, {
			sender: player.dbId,
			message,
			timestamp: moment().toISOString(),
		});

		hud.showNotification(player, 'info', 'Tvoja prijava je uspešno prosleđena administraciji.', true);

		this.notifyAdmins(`${player.getName()} (${player.mp.id}) je prijavio: ${message} #${iReport}`);

		iReport++;
	}

	notifyAdmins(message: string) {
		mp.players
			.toCustomArray()
			.forEach(
				(player) =>
					player.adminLvl && player.mp.outputChatBox(`!{${colors.adminRed}}[A]: !{${colors.white}}${message}`)
			);
	}

	private accept(player: Player, reportId: number) {
		if (!reportId) {
			player.mp.outputChatBox(`!{95e800}[GREŠKA]: !{${colors.white}}/report [Report #ID]`);
			return;
		}

		if (!permissions.hasPermission(player, 'jadmin')) {
			throw new SilentError('access denied');
		}

		if (!this.reports.has(reportId)) return;

		this.reports.delete(reportId);

		this.notifyAdmins(`${player.getName()} je prihvatio report #${reportId}`);
	}

	private isReported(sender: string) {
		const report = [];
		this.reports.forEach((item) => {
			if (item.sender === sender && moment(item?.timestamp).add(2, 'minutes').isAfter()) report.push(item);
		});

		return report.length >= 1;
	}

	private getReports(player: Player, page: number) {
		const data = Array.from(this.reports.entries()).map(([key, value]) => ({
			id: key,
			...value,
		}));

		return data.slice((page - 1) * 5, page * 5).map((item) => {
			const sender = players.getByDbId(item.sender);

			return {
				...item,
				sender: sender ? `${sender.getName()} (${sender.mp.id})` : 'Deleted',
			};
		});
	}

	private showAdminsReports(player: Player, sPage: number) {
		if (!permissions.hasPermission(player, 'jadmin')) return;

		let page = Number(sPage || 1);
		const pages = Math.ceil(this.reports.size / 5);
		if (Number(page) > pages) page = pages;

		const reports = this.getReports(player, Number(page));

		player.mp.outputChatBox(`!{${colors.adminRed}}========== Reports ==========`);
		reports.forEach((report) => {
			player.mp.outputChatBox(
				`!{${colors.adminRed}}[Report #${report.id}]: !{${colors.white}}${report.sender} - ${report.message}`
			);
		});
		player.mp.outputChatBox(
			`!{${colors.adminRed}}============ !{${colors.white}} ${page}/${pages} !{${colors.adminRed}}============`
		);
	}
}

export default new Report();
