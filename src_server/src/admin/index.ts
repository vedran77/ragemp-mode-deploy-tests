import moment from 'moment';

import { chatErrorMessages } from 'helpers/commands';
import money from 'helpers/money';
import hud from 'helpers/hud';
import chat from 'basic/chat';
import permissions, { AdminLevels } from './permissions';
import journal from './journal';
import antiCheat from 'basic/anti-cheat';
import animations from 'helpers/animations';
import emsCalls from 'factions/lsfd/calls';
import { colors } from 'basic/chat/commands';

import './staff';
import './ban';
import './report';
import './vehicle';
import './house';
import './demorgan';
import './faction';
import './teleport';
import './gangzones';
import './faction-vehicles';

class Admin {
	constructor() {
		mp.events.addCommands({
			ahelp: this.showAdminHelp,
			ao: this.sendChatMessage,
			esp: this.toggleESP,
			inv: this.toggleInvisible,
			aduty: this.toggleAdminDuty.bind(this),
			cords: this.printCords.bind(this),
			sc: this.changePlayerClothes,
			afix: this.fixVehicle,
			aheal: this.healPlayer,
			arevive: this.revivePlayer,
			aspawn: this.spawnPlayer,
			asettime: this.setTime,
			asetweather: this.setWeather,
			asetskin: this.changePlayerModel,
			asetmoney: this.changeMoney,
			aspec: this.spectateForPlayer,
			akick: this.kickPlayer,
		});

		this.subscribeToEvents();
	}

	private setTime(admin: Player, time: string) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (global.aTime && !time) {
			admin.mp.outputChatBox(chatErrorMessages.error('Vreme je vraćeno na sinhronizaciju.'));

			global.aTime = null;
			return;
		}

		if (!time) {
			admin.mp.outputChatBox(chatErrorMessages.error('/asettime [SATI] [MINUTI]'));
			return;
		}

		const args = time.split(' ');

		global.aTime = moment().format();
		mp.world.time.hour = parseInt(args[0], 10);
		mp.world.time.minute = parseInt(args[1], 10) || 0;
	}

	private setWeather(admin: Player, weather: string) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (global.aWeather && !weather) {
			admin.mp.outputChatBox(chatErrorMessages.error('Vreme je vraćeno na sinhronizaciju.'));

			global.aWeather = null;
			return;
		}

		if (!weather) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('/asetweather [VREME] (CLEAR | SUNNY | RAIN | THUNDER | SNOW)')
			);
			return;
		}

		global.aWeather = moment().format();
		mp.world.weather = weather;
		mp.players.call('Weather-Change', [weather]);
	}

	private spawnPlayer(admin: Player, target: number) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (!target) {
			admin.mp.outputChatBox(chatErrorMessages.error('/aspawn [ID]'));
			return;
		}

		const player = mp.players.get(target);

		if (!player) {
			admin.mp.outputChatBox(chatErrorMessages.error('Igrač nije na serveru!'));
			return;
		}

		if (player) {
			antiCheat.sleep(player, 4000);
			player.tp({ x: -1032.353, y: -2731.16, z: 13.757 }, 88.233);

			journal.recordAction(admin, 'spawn', `RESPAWN | ${player.getName()}`, player.dbId);
		}
	}

	private revivePlayer(admin: Player, target: number) {
		if (!permissions.hasPermission(admin, 'admin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (!target) {
			admin.mp.outputChatBox(chatErrorMessages.error('/arevive [ID]'));

			return;
		}

		const player = mp.players.at(target);
		const playerData = mp.players.get(player);

		if (!player) {
			admin.mp.outputChatBox(chatErrorMessages.error('Igrač nije na serveru!'));
			return;
		}

		if (!playerData.dead) {
			admin.mp.outputChatBox(chatErrorMessages.error('Igrač nije mrtav!'));
			return;
		}

		if (player) {
			player.health = 100;
			player.setVariable('death', false);
			emsCalls.cancelCall(playerData.dbId);
			animations.stopOnServer(player);

			journal.recordAction(admin, 'revive', `REVIVE | ${playerData.getName()}`, playerData.dbId);
		}
	}

	private healPlayer(admin: Player, target: number) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (!target) {
			admin.mp.outputChatBox(chatErrorMessages.error('/aheal [ID]'));
			return;
		}

		const player = mp.players.at(target);
		const playerData = mp.players.get(player);

		if (!player) {
			admin.mp.outputChatBox(chatErrorMessages.error('Igrač nije na serveru!'));
			return;
		}

		if (player) {
			player.health = 100;

			journal.recordAction(admin, 'heal', `HEAL | ${playerData.getName()}`, playerData.dbId);
		}
	}

	private fixVehicle(admin: Player) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		const vehicle = admin.mp.vehicle;
		if (vehicle) {
			vehicle.repair();

			const fuel = vehicle.getVariable('fuel');
			vehicle.setVariable('fuel', {
				...fuel,
				current: fuel.max,
			});

			journal.recordAction(admin, 'fix', `${vehicle.model} | ${vehicle.dbId}`, vehicle.dbId);
		}
	}

	private kickPlayer(admin: Player, data: any) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		const args = data?.split(' ');
		if (!args || args.length < 2) {
			admin.mp.outputChatBox(chatErrorMessages.error('/akick [ID] [RAZLOG]'));
			return;
		}

		const [target, reason] = args;

		const player = mp.players.at(target * 1);

		if (!player) {
			admin.mp.outputChatBox(chatErrorMessages.error('Igrač nije na serveru!'));
			return;
		}

		const playerData = mp.players.get(player);

		if (playerData) {
			playerData.mp.kick(reason);

			journal.recordAction(admin, 'kick', `${playerData.getName()} | ${reason}`, playerData.dbId);
			chat.sendSystem(`${admin.getName()} kikovao ${playerData.getName()} (${reason})`);
		}
	}

	private changePlayerModel(admin: Player, data: any) {
		if (!permissions.hasPermission(admin, 'admin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		const args = data?.split(' ');

		if (!args || args.length < 2) {
			admin.mp.outputChatBox(chatErrorMessages.error('/asetskin [ID] [MODEL]'));
			return;
		}

		const [target, model] = args;
		const player = mp.players.get(target * 1);

		if (!player) {
			admin.mp.outputChatBox(chatErrorMessages.error('Igrač nije na serveru!'));
			return;
		}

		if (player) {
			player.mp.model = mp.joaat(model);
			journal.recordAction(admin, 'skin', `${player.getName()} | ${model}`, player.dbId);
		}
	}

	private changePlayerClothes(admin: Player, data: any) {
		if (!permissions.hasPermission(admin, 'owner') || !admin.mp.getVariable('ADUTY') || !data) return;

		const args = data?.split(' ');

		if (args.length !== 4) return;

		admin.mp.setClothes(args[0] * 1, args[1] * 1, args[2] * 1, args[3] * 1);
	}

	private async changeMoney(admin: Player, data: any) {
		if (!permissions.hasPermission(admin, 'manager') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		const args = data?.split(' ');

		if (!args || args.length < 2) {
			return admin.mp.outputChatBox(chatErrorMessages.error('/amoney [ID] [SUMA]'));
		}

		const [targetId, sum] = args;
		const player = mp.players.at(targetId * 1);

		if (!player) {
			admin.mp.outputChatBox(chatErrorMessages.error('Igrač nije na serveru!'));
			return;
		}

		const target = mp.players.get(player);
		if (!target) return;

		await money.change(target, 'bank', sum, `admin money | ${admin.dbId}`);
		journal.recordAction(admin, 'money', `${target.getName()} | ${sum}$`, target.dbId);
	}

	private spectateForPlayer(admin: Player, target?: number) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (!target) {
			admin.mp.alpha = 255;
			admin.mp.setVariable('invisible', true);

			admin.callEvent('Admin-ToggleESP', 0);
			admin.callEvent('Admin-Spectate', null);
			return;
		}

		admin.mp.alpha = 0;
		admin.mp.setVariable('invisible', false);

		admin.callEvent('Admin-ToggleESP', 1);
		admin.callEvent('Admin-Spectate', mp.players.get(target)?.mp);
	}

	private toggleESP(admin: Player, mode: any) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		admin.callEvent('Admin-ToggleESP', parseInt(mode, 10));
	}

	private printCords(admin: Player) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		chat.sendSystem(`Cords: ${admin.mp.position} - ${admin.mp.heading}`);
		console.log(`Cords: ${admin.mp.position} - ${admin.mp.heading}`);
	}

	private toggleInvisible(admin: Player) {
		if (!permissions.hasPermission(admin, 'jadmin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		const { mp } = admin;

		if (!mp.alpha) mp.alpha = 255;
		else mp.alpha = 0;

		mp.setVariable('invisible', !mp.alpha);
	}

	private toggleAdminDuty(admin: Player) {
		if (!permissions.hasPermission(admin, 'jadmin')) return;

		const status: boolean = admin.mp.getVariable('ADUTY');

		admin.mp.setVariable('ADUTY', !status);
		admin.mp.setVariable('AGM', !status);

		admin.callEvent('Admin-SetGM', !status);

		hud.showNotification(admin, 'success', `Admin Status ${status ? 'isključen' : 'uključen'}`);
	}

	private sendChatMessage(admin: Player, text: string) {
		if (!permissions.hasPermission(admin, 'admin') || !admin.mp.getVariable('ADUTY')) {
			admin.mp.outputChatBox(
				chatErrorMessages.error('Nemate dozvolu za ovu komandu ili niste na admin duznost!')
			);
			return;
		}

		if (!text) return admin.mp.outputChatBox(chatErrorMessages.error('/ao [TEXT]'));

		const adminLevel = Object.values(AdminLevels).find((item) => item.level === admin.adminLvl);

		chat.sendSystem(`!{${colors.adminRed}}[ADMIN OOC] ${adminLevel.name} ${admin.getName()}: !{ffffff}${text}`);
	}

	private getPlayers(player: Player) {
		if (!player.adminLvl) return [];

		return mp.players.toCustomArray().map((item) => ({
			id: item.mp.id,
			dbId: item.dbId,
			name: item.getName(),
		}));
	}

	private showAdminHelp(admin: Player, sPage: string) {
		if (!admin.adminLvl) return;

		const commands = [
			'/aduty - Toggle admin duty',
			'/ao [TEXT] - Admin chat',
			'/areports - Reports list',
			'/asettime [HOUR] [MINUTE] - Set time',
			'/asetweather [WEATHER] - Set weather',
			'/aspawn [ID] - Spawn player',
			'/arevive [ID] - Revive player',
			'/aheal [ID] - Heal player',
			'/afix - Fix vehicle',
			'/asetskin [ID] [MODEL] - Set player skin',
			'/asc [ID] [TYPE] [VARIATION] [TEXTURE] - Set player clothes',
			'/amoney [ID] [SUMA] - Change player money',
			'/aspec [ID] - Spectate player',
			'/akick [ID] [REASON] - Kick player',
			'/esp [0-2] - Toggle ESP',
		];

		let page = Number(sPage || 1);
		const pages = Math.ceil(commands.length / 5);
		if (Number(page) > pages) page = pages;

		admin.mp.outputChatBox(`!{${colors.adminRed}}========== ADMIN HELP ==========`);
		commands.slice((page - 1) * 5, page * 5).forEach((item) => {
			admin.mp.outputChatBox(item);
		});
		admin.mp.outputChatBox(
			`!{${colors.adminRed}}[NOTICE]: !{${colors.white}}Za izvršavanje bilo koje komande, potrebno je da budete na admin dužnost.`
		);
		admin.mp.outputChatBox(
			`!{${colors.adminRed}}============ !{${colors.white}} ${page}/${pages} !{${colors.adminRed}}============`
		);
	}

	private subscribeToEvents() {
		mp.events.subscribe({
			'Admin-GetPlayers': this.getPlayers,
			'Admin-SendToChat': this.sendChatMessage.bind(this),
		});
	}
}

export default new Admin();
