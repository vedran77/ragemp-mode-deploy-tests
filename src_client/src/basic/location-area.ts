import {
	SET_BLIP_FLASHES,
	SET_BLIP_COLOR,
	SET_BLIP_SPRITE,
	SET_BLIP_ALPHA,
	SET_BLIP_ROTATION,
} from 'natives';

type Zone = {
	id: string;
	position: Vector3Mp;
	status: boolean;
	color: number;
	blip?: BlipMp;
};

class LocationArea {
	private zone: Zone;

	constructor() {
		mp.events.subscribeToDefault({
			render: this.fixBlipsRotation.bind(this),
		});

		mp.events.subscribe({
			'LocationArea-Create': this.createBlip.bind(this),
			'LocationArea-Delete': this.deleteArea.bind(this),
		});
	}

	deleteArea(id?: string) {
		if (id && this.zone?.id !== id) return;

		SET_BLIP_ALPHA(this.zone.blip, 0);
		mp.game.ui.removeBlip(this.zone.blip.id);
		this.zone = null;
	}

	private createBlip(
		id: string,
		position: PositionEx,
		color = 25,
		flashes = false,
		radius = 200
	) {
		if (this.zone) {
			this.deleteArea();
		}

		const { x, y } = position;
		const blip = mp.game.ui.addBlipForRadius(x, y, 1, radius);

		SET_BLIP_SPRITE(blip, 9);
		SET_BLIP_ALPHA(blip, 200);
		SET_BLIP_COLOR(blip, color);
		SET_BLIP_FLASHES(blip, flashes);

		this.zone = {
			id,
			position: new mp.Vector3(x, y, 1),
			status: flashes,
			color,
			blip,
		};
	}

	private fixBlipsRotation() {
		if (this.zone?.blip) SET_BLIP_ROTATION(this.zone.blip, 0);
	}
}

export default new LocationArea();
