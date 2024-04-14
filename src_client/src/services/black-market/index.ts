import { fromObject } from 'utils/vector';
import hud from 'basic/hud';
import { ped as marketPed, locations } from './data';
import conversations from 'data/сonversations.json';
import locationArea from 'basic/location-area';

type BlackMarketPed = {
	position: Vector3Mp;
	pedId: number;
	colshapeId: number;
};

const localPlayer = mp.players.local;

class BlackMarket {
	private ped: BlackMarketPed | null = null;

	constructor() {
		mp.events.subscribe({
			'BlackMarket-Answer': this.onAnswer.bind(this),
			'BlackMarket-NewLocation': this.newLocation.bind(this),
		});

		this.init();
	}

	private async newLocation(newLocation?: Vector3Mp) {
		const position =
			newLocation || (await mp.events.callServer('BlackMarket-Call'));

		if (!position) {
			return;
		}

		const location = locations.find(
			(item) =>
				item.position.x === position.x &&
				item.position.y === position.y &&
				item.position.z === position.z
		);

		const ped = mp.peds.at(this.ped.pedId);
		const colshape = mp.colshapes.at(this.ped.colshapeId);

		ped.destroy();
		colshape.destroy();

		this.createPed(
			new mp.Vector3(
				location.position.x,
				location.position.y,
				location.position.z
			),
			location.rotation
		);
	}

	private onEnterPedZone() {
		const npc = mp.peds.at(this.ped.pedId);

		mp.game.audio.playAmbientSpeechWithVoice(
			npc.handle,
			marketPed.speech,
			marketPed.voice,
			'SPEECH_PARAMS_FORCE_NORMAL',
			false
		);

		locationArea.deleteArea('bm11332');

		hud.showInteract('E');
	}

	private onAnswer(index: number) {
		const conversation = conversations[marketPed.conversation];

		if (!conversation) return;

		const answer = conversation.answers[index];

		// Stop conversation
		localPlayer.setAlpha(255);
		mp.cameras.reset(1500);
		mp.browsers.hidePage();

		if (answer?.callback) {
			const [event, ...data] = answer.callback;

			mp.events.callServer(event, data, false);
		}
	}

	private show() {
		if (localPlayer.vehicle) return;

		const conversation = conversations[marketPed.conversation];
		const location = locations.find(
			(item) =>
				item.position.x === this.ped.position.x &&
				item.position.y === this.ped.position.y &&
				item.position.z === this.ped.position.z
		);

		if (conversation) {
			localPlayer.setAlpha(0);

			mp.cameras.set(
				fromObject(location.camera.position),
				new mp.Vector3(0, 0, 0),
				location.camera.point,
				40,
				1500
			);

			mp.browsers.showPage(
				'dialog',
				{ ...conversation, 'black-market': true },
				true,
				true
			);
		}
	}

	private async init() {
		const position = await mp.events.callServer('BlackMarket-Location');

		if (!position) {
			return;
		}

		const location = locations.find(
			(item) =>
				item.position.x === position.x &&
				item.position.y === position.y &&
				item.position.z === position.z
		);

		this.createPed(
			new mp.Vector3(position.x, position.y, position.z),
			location.rotation
		);
	}

	private createPed(position, rotation) {
		const ped = mp.peds.new(
			mp.game.joaat(marketPed.model),
			position,
			rotation,
			0
		);

		const colshape = mp.colshapes.create(
			position,
			2.5,
			{
				onEnter: this.onEnterPedZone.bind(this),
				onKeyPress: this.show.bind(this),
				onExit: () => hud.showInteract(),
			},
			{ ped: ped.id }
		);

		this.ped = {
			position,
			pedId: ped.id,
			colshapeId: colshape.id,
		};
	}
}

export default new BlackMarket();
