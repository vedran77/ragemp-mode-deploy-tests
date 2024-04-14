import {
	GET_FIRST_BLIP_INFO_ID,
	GET_NEXT_BLIP_INFO_ID,
	DOES_BLIP_EXIST,
	SET_BLIP_ALPHA,
} from 'natives';
import { fromObject } from 'utils/vector';

type Options = {
	name: string;
	color: number;
	alpha?: number;
	dimension?: number;
	scale?: number;
	drawDistance?: number;
};

class Blips {
	private items: Map<string, BlipMp>;

	private point?: BlipMp;

	constructor() {
		this.items = new Map();

		mp.events.subscribe({
			'Blips-CreateItem': this.createItem.bind(this),
			'Blips-CreatePoint': this.createPoint.bind(this),
			'Blips-AddUiBlipRadius': this.createBlipRadius.bind(this),
			'Blips-FlashUiBlip': this.createBlipRadius.bind(this),
			'Blips-Delete': this.delete.bind(this),
		});
		this.clearRadiusBlips();
	}

	createBlipRadius(
		id: string,
		x: number,
		y: number,
		radius: number,
		color: number
	) {
		const blip: BlipMp = mp.game.ui.addBlipForRadius(x, y, 1, radius);

		// setBlipSprite
		mp.game.invoke('0xDF735600A4696DAF', blip, 1);
		// setBlipAlpha
		mp.game.invoke('0x45FF974EEE1C8734', blip, 70);
		// setBlipColour
		mp.game.invoke('0x03D7FB09E75D6B7E', blip, color);

		this.items.set(id, blip);
		return blip;
	}

	createPoint(position: PositionEx, color: number) {
		if (this.point) this.point.destroy();

		this.point = this.create(0, position, {
			name: 'Checkpoint',
			drawDistance: 1000,
			color,
		});

		this.setRoute(this.point, color);
	}

	delete(name?: string) {
		const blip = this.items.get(name);

		if (!blip && this.point) {
			this.point.destroy();
			this.point = null;
		} else if (blip) {
			blip.destroy();
			this.items.delete(name);
		}
	}

	private setRoute(blip: BlipMp, color: number) {
		blip.setRoute(true);
		blip.setRouteColour(color);
	}

	private createItem(
		id: string,
		model: number,
		position: PositionEx,
		options: Options
	) {
		const blip = this.create(model, position, options);

		this.items.set(id, blip);
	}

	private create(model: number, position: PositionEx, options: Options) {
		return mp.blips.new(model, fromObject(position), {
			scale: 1,
			drawDistance: 100,
			shortRange: false,
			...options,
		});
	}

	private clearRadiusBlips() {
		let last_blip = GET_FIRST_BLIP_INFO_ID(5);

		while (DOES_BLIP_EXIST(last_blip)) {
			SET_BLIP_ALPHA(last_blip, 0);
			last_blip = GET_NEXT_BLIP_INFO_ID(5);
		}
	}
}

export default new Blips();
