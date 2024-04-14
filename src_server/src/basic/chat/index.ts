import Faction from 'factions/faction';
import chatCommands, { COMMANDS, colors } from './commands';
import factionChat from './faction';

class Chat {
	public colors = colors;

	constructor() {
		mp.events.subscribeToDefault({
			playerChat: (player: Player, data: string) => {
				try {
					const { mode, text } = JSON.parse(data);
					this.sendPlayerMessage(player, text, mode);
				} catch (err) {
					console.log(err, data, 'chat error');
				}
			},
		});

		mp.events.add('playerCommand', (player, command) => {
			player.outputChatBox(`!{95e800}[GREŠKA]: !{ffffff}Komanda ${command} ne postoji!`);
		});
	}

	sendSystem(message: string, color = 'b80614', prefix = 'SYSTEM') {
		if (prefix) {
			this.sendToAll(`!{${color}}[${prefix}]: ${message}`);
			return;
		}

		this.sendToAll(`!{${color}}${message}`);
	}

	sendPlayerMessage(player: Player, message: string, command: COMMANDS) {
		if (!message.length) return;

		const { position } = player.mp;

		const text = chatCommands.prepareString(chatCommands.getTemplate(message.trim(), command), [player]);

		switch (command) {
			case COMMANDS.SCREAM:
				this.sendNear(position, text, 30);
				break;

			case COMMANDS.WHISPER: {
				const [id] = message.split(' ');
				const target = mp.players.at(parseInt(id, 10));
				if (!player.entityIsNearby(target)) return;

				this.sendToPlayer(target, text);
				break;
			}
			case COMMANDS.PM: {
				const [id] = message.split(' ');
				const target = mp.players.at(parseInt(id, 10));

				this.sendToPlayer(target, text);
				this.sendToAdmins(
					`!{${colors.adminRed}}[PM] !{${colors.white}}[${player.mp.name}] !{${colors.adminRed}}-> !{${colors.white}}[${target.name}]: text`
				);
				break;
			}

			case COMMANDS.ADMIN_CHAT:
				if (!player.adminLvl) return;

				this.sendToAdmins(text);
				break;
			case COMMANDS.APM: {
				if (!player.adminLvl) return;

				const [id] = message.split(' ');
				const target = mp.players.at(parseInt(id, 10));

				this.sendToPlayer(target, text);
				break;
			}

			default:
				if (chatCommands.isFactionCommand(command)) {
					factionChat.sendMessage(player, text, command);
				} else this.sendNear(position, text);
				break;
		}
	}

	sendToAll(message: string) {
		mp.players.broadcast(message);
	}

	sendNear(position: Vector3Mp, message: string, range = 10) {
		mp.players.broadcastInRange(position, range, message);
	}

	sendToPlayer(player: PlayerMp, message: string) {
		player.outputChatBox(message);
	}

	sendToFaction(faction: Faction, message: string) {
		faction.getPlayers().forEach((player) => {
			this.sendToPlayer(player.mp, message);
		});
	}

	sendToAdmins(message: string) {
		mp.players
			.toCustomArray()
			.filter((player) => player.adminLvl)
			.forEach((player) => {
				this.sendToPlayer(player.mp, message);
			});
	}
}

export { COMMANDS };

export default new Chat();
