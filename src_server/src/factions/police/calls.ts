import rpc from 'rage-rpc';
import cryptoRandomString from 'crypto-random-string';

import factions from 'factions';
import hud from 'helpers/hud';
import { colors } from 'basic/chat/commands';
import { getDistance } from 'utils/vectors';
import { chatErrorMessages } from 'helpers/commands';

type Call = {
	message?: string;
	position: Vector3Mp;
	createdAt: string;
	acceptedBy?: string[];
};

type EmergencyCall = {
	id?: string;
	message: string;
	position: Vector3Mp;
	number?: string;
};

class PoliceCalls {
	private calls: Map<string, Call>;

	constructor() {
		this.calls = new Map();

		mp.events.subscribeToDefault({
			'PoliceCalls-CreateCallout': this.createCallout.bind(this),
		});

		mp.events.subscribe({
			'PoliceCalls-GetList': this.getCallsList.bind(this),
			'PoliceCalls-MarkPosition': this.markPosition.bind(this),
			'PoliceCalls-Create': this.createEmergencyCall.bind(this),
		});

		mp.events.addCommand({
			accept: (entity, callId) => {
				const player = mp.players.get(entity);
				this.markPosition(player, callId);
			},
			removecall: (entity, callId) => {
				const player = mp.players.get(entity);
				this.deleteCall(player, callId);
			},
		});
	}

	async deleteCall(player: Player, callId: string) {
		if (!callId || (!['lspd', 'lssd'].includes(player.faction) && player.mp.getOwnVariable('factionWork'))) return;

		if (!callId || !this.calls.has(callId)) {
			player.mp.outputChatBox('!{95e800}[GREŠKA]: !{ffffff}/accept [BROJ POZIVA]!');
			return;
		}

		this.members()?.forEach(async (member: Player) => {
			const org = player.faction?.toUpperCase();
			const toOrg = player.faction === 'lspd' ? 'LSSD' : 'LSPD';

			member.mp.outputChatBox(
				`!{${
					colors.radioChat
				}}[HQ]: ${org} -> ${toOrg} !{ffffff}${player.getName()} je obrisao poziv "${callId}"`
			);

			member.callEvent('LocationArea-Delete', callId, false);
		});

		this.calls.delete(callId);
	}

	checkCallouts(position: Vector3Mp) {
		const currentTime = Date.now();

		return Array.from(this.calls.keys()).some((key) => {
			const call = this.calls.get(key);
			if (!call) return false;

			return (
				(call.createdAt && currentTime - new Date(call.createdAt).getTime() < 30 * 1000) ||
				getDistance(position, call.position) < 200
			);
		});
	}

	private generateCallId() {
		const callId = cryptoRandomString({ length: 4, type: 'numeric' });

		if (this.calls.has(callId)) {
			return this.generateCallId();
		}

		return callId;
	}

	getCall(id: string) {
		return this.calls.get(id);
	}

	private getCallsList() {
		return Array.from(this.calls.entries()).map(([id, { createdAt, message }]) => ({
			id,
			message,
			createdAt,
		}));
	}

	createCall({ id, message, position, number }: EmergencyCall) {
		const uid = id || this.generateCallId();

		this.calls.set(uid, {
			message,
			position,
			createdAt: new Date().toISOString(),
		});

		this.notifyMembers({ id: uid, message, position, number });
	}

	createCallout(player: Player, data: string | EmergencyCall, timer = true) {
		const currentTime = Date.now();
		const { id, message, position } = (typeof data === 'string' ? JSON.parse(data) : data) as EmergencyCall;

		if (!position) return;

		const isAlreadyCalled = [...this.calls.keys()].some((key) => {
			const call = this.calls.get(key);
			if (!call) return false;

			return (
				call.createdAt &&
				currentTime - new Date(call.createdAt).getTime() < 30 * 1000 &&
				player.mp.dist(call?.position) < 200
			);
		});

		if (isAlreadyCalled) {
			return;
		}

		if (timer) {
			setTimeout(() => {
				this.createCall({ id, message, position });
			}, 30 * 1000);
		} else {
			this.createCall({ id, message, position });
		}
	}

	createEmergencyCall(player: Player, message: string) {
		const position = player.mp.position;

		this.createCall({
			message,
			position,
			number: `${player.mp.name} (${player.phone.number})`,
		});
	}

	private async markPosition(player: Player, callId: string) {
		if (!['lspd', 'lssd'].includes(player.faction) && player.mp.getOwnVariable('factionWork')) return;

		if (!callId) {
			player.mp.outputChatBox('!{95e800}[GREŠKA]: !{ffffff}/accept [BROJ POZIVA]!');
			return;
		}

		const call = this.getCall(callId);
		if (!call) return;

		if (call.acceptedBy?.includes(player.dbId))
			return player.mp.outputChatBox('!{95e800}[GREŠKA]: !{ffffff}Već si prihvatio ovaj poziv!');

		const position = {
			x: call.position.x + 30,
			y: call.position.y + 60,
			z: call.position.z,
		};

		await rpc.callClient(player.mp, 'LocationArea-Create', [callId, position]);

		call.acceptedBy = [...(call.acceptedBy || []), player.dbId];

		hud.showNotification(player, 'info', 'Pozicija označena na mapi!', true);

		this.members()?.forEach((member: Player) => {
			const org = player.faction?.toUpperCase();
			const toOrg = player.faction === 'lspd' ? 'LSSD' : 'LSPD';

			member.mp.outputChatBox(
				`!{${
					colors.radioChat
				}}[HQ]: ${org} -> ${toOrg} !{ffffff}${player.getName()} je prihvatio poziv "${callId}"`
			);
		});
	}

	members(atWork = true) {
		const police = factions.getFaction('lspd');
		const sheriff = factions.getFaction('lssd');

		return [...police.getPlayers(atWork), ...sheriff.getPlayers(atWork)] as Player[];
	}

	private async notifyMembers({ id, message, position, number }: EmergencyCall) {
		this.members()?.forEach(async (member: Player) => {
			const { zone, street } = await rpc.callClient(member.mp, 'getLocationByCoords', position);

			if (!number) {
				member.mp.outputChatBox(
					`!{${colors.radioChat}}[** CENTRAL DISPATCH **]: ${message} na lokaciji ${street} (${zone}) | "/accept ${id}"`
				);
				return;
			}

			member.mp.outputChatBox(`!{${colors.factionChat}}========== EMERGENCY CALL ==========`);
			member.mp.outputChatBox(`!{${colors.factionChat}}* BR. Poziva: !{ffffff}"${id}"`);

			member.mp.outputChatBox(`!{${colors.factionChat}}* Pozvao: !{ffffff}${number}`);

			member.mp.outputChatBox(
				`!{${colors.factionChat}}* Lokacija: !{ffffff}${street} (${zone || 'Nepoznata'}) | "/accept ${id}"`
			);

			member.mp.outputChatBox(`!{${colors.factionChat}}* Situacija: !{ffffff}${message}`);
		});
	}
}

export default new PoliceCalls();
