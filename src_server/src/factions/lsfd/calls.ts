import hud from 'helpers/hud';
import ems from 'factions/lsfd';
import { colors } from 'basic/chat/commands';

type Call = {
	medic?: string;
	position: Vector3Mp;
	createdAt: string;
};

class EmsCalls {
	private calls: Map<string, Call>;

	constructor() {
		this.calls = new Map();

		mp.events.subscribe({
			'EmsCalls-GetList': this.getCallsList.bind(this),
			'EmsCalls-Accept': this.acceptCall.bind(this),
			'EmsCalls-Create': this.createCall.bind(this),
		});

		mp.events.addCommand('accept', (entity, callId) => {
			const player = mp.players.get(entity);
			this.acceptCall(player, callId);
		});
	}

	cancelCall(id: string) {
		const call = this.getCall(id);
		if (!call) return;

		const medic = mp.players.getByDbId(call.medic);
		if (medic) mp.blips.delete(medic, 'Checkpoint');

		this.calls.delete(id);
	}

	private getCall(id: string) {
		return this.calls.get(id);
	}

	private getCallsList(player: Player) {
		if (!ems.inFaction(player)) throw new SilentError('access denied');

		return Array.from(this.calls.entries()).flatMap(([id, { medic, position, createdAt }]) => {
			const victim = mp.players.getByDbId(id);

			return !medic && victim
				? {
						id,
						createdAt,
						victim: victim.getName(),
						dist: player.mp.dist(position),
				  }
				: [];
		});
	}

	private hasAcceptedCall(player: Player) {
		return Array.from(this.calls.values()).findIndex((call) => call.medic === player.dbId) > -1;
	}

	private createCall(player: Player) {
		if (this.calls.has(player.mp.id.toString())) throw new SilentError('call is already created');

		this.calls.set(player.mp.id.toString(), {
			position: player.mp.position,
			createdAt: new Date().toISOString(),
		});

		this.notifyMedics('Imate novi poziv, reagujte brzo! da prihvatiš poziv /accept ' + player.mp.id.toString());
	}

	private acceptCall(player: Player, id: string) {
		if (player.faction !== 'lsfd') return;

		if (!id) {
			player.mp.outputChatBox('!{95e800}[GREŠKA]: !{ffffff}/accept [BROJ POZIVA]!');
			return;
		}

		const call = this.getCall(id);

		if (!call) return mp.events.reject('Ovaj poziv je već prihvaćen');
		if (this.hasAcceptedCall(player)) return mp.events.reject('Već ste prihvatili poziv');

		const victim = mp.players.getByDbId(id);

		if (victim) {
			this.calls.set(id, { ...call, medic: player.dbId });

			mp.blips.create(call.position, { model: 0, color: 1, name: 'Checkpoint' }, player);
			hud.showNotification(victim, 'info', 'Bolničar je prihvatio vaš poziv, uskoro će stići po vas');

			hud.showNotification(player, 'info', 'Pozicija označena na mapi!', true);
		}
	}

	private notifyMedics(message: string) {
		ems.getPlayers(true).forEach((member) => {
			member.mp.outputChatBox(`!{${colors.factionChat}}[Poziv 911]: !{ffffff}${message}`);
		});
	}
}

export default new EmsCalls();
