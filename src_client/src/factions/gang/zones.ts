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
	radius: number;
};

class GangZones {
	private zones: Map<string, Zone>;

	constructor() {
		this.zones = new Map();

		mp.events.subscribeToDefault({
			render: this.fixBlipsRotation.bind(this),
		});
		mp.events.subscribe({
			'GangZones-UpdateZone': this.updateZone.bind(this),
			'GangZones-CreateZone': this.createZone.bind(this),
			'GangZones-DeleteZone': this.deleteZone.bind(this),
		});
	}

	async load() {
		const items: Zone[] = await mp.events.callServer('GangZones-GetList');

		items.forEach((item) => {
			const blip = this.createBlip(
				item.position,
				item.color,
				item.radius,
				item.status
			);
			this.zones.set(item.id, { ...item, blip });
		});
	}

	private createZone(zone: Zone) {
		const blip = this.createBlip(
			zone.position,
			zone.color,
			zone.radius,
			false
		);
		this.zones.set(zone.id, { ...zone, blip });
	}

	private updateZone(zoneId: string, color: number, status: boolean) {
		const zone = this.zones.get(zoneId);
		if (!zone?.blip) return;

		zone.status = status;
		this.setColor(zone, color);
		SET_BLIP_FLASHES(zone.blip, status);
	}

	private setColor(zone: Zone, color: number) {
		zone.color = color;
		SET_BLIP_COLOR(zone.blip, color);
	}

	private createBlip(
		position: PositionEx,
		color: number,
		radius?: number,
		flashes = false
	) {
		const { x, y } = position;
		const blip = mp.game.ui.addBlipForRadius(x, y, 1, radius || 50);

		SET_BLIP_SPRITE(blip, 5);
		SET_BLIP_ALPHA(blip, 160);
		SET_BLIP_COLOR(blip, color);
		SET_BLIP_FLASHES(blip, flashes);

		return blip;
	}

	private deleteZone(zoneId: string) {
		const zone = this.zones.get(zoneId);
		if (!zone) return;

		if (zone.blip) {
			SET_BLIP_ALPHA(zone.blip, 0);
			mp.game.ui.removeBlip(zone.blip.id);
		}
		this.zones.delete(zoneId);
	}

	private fixBlipsRotation() {
		Array.from(this.zones.values()).forEach((zone) => {
			if (zone.blip) SET_BLIP_ROTATION(zone.blip, 0);
		});
	}
}

export default new GangZones();
