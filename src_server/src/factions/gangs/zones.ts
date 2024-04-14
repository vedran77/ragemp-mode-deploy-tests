import { sortBy } from 'lodash';
import { getDistance } from 'utils/vectors';
import factions from 'factions';
import GangZoneModel from 'models/GangZone';
import gangs from './data';

export type Zone = {
	id: string;
	position: PositionEx;
	owner: string;
	capturedAt: string;
	status: boolean;
	radius?: number;
	mapBlip?: BlipMp;
	label?: TextLabelMp;
};

const labelText = '~r~Teritorija\n~s~Vlasnik teritorije: ~b~%s\n~s~/zauzmi';

class GangsZones {
	private zones: Map<string, Zone>;
	private income = 1000;

	constructor() {
		this.zones = new Map();

		mp.events.subscribe(
			{
				'GangZones-GetInfo': this.getInfo.bind(this),
				'GangZones-GetList': this.getZonesForClient.bind(this),
			},
			false
		);
	}

	async load() {
		const cursor = await GangZoneModel.find().lean().cursor();
		cursor.on('data', this.createZone.bind(this));
	}

	getNearestZone(pos: Vector3Mp) {
		return Array.from(this.zones.values()).find(
			({ position }) =>
				getDistance(
					pos,
					new mp.Vector3(position.x, position.y, position.z)
				) < 5
		);
	}

	giveMoney() {
		const gangsIncome: { [name: string]: number } = {};

		Array.from(this.zones.values()).forEach((zone) => {
			if (gangsIncome[zone.owner]) gangsIncome[zone.owner] += this.income;
			else gangsIncome[zone.owner] = this.income;
		});

		Object.entries(gangsIncome).forEach(([name, sum]) => {
			const gang = factions.getFaction(name);
			if (gang) gang.money.changeBalance(sum);
		});
	}

	async setOwner(zone: Zone, owner: string) {
		const data = {
			owner,
			capturedAt: new Date().toISOString(),
		};

		await GangZoneModel.findByIdAndUpdate(zone.id, { $set: data });
		this.zones.set(zone.id, { ...zone, ...data, status: false });
		this.updateZoneBlip(this.zones.get(zone.id));
	}

	updateZoneBlip(zone: Zone) {
		const newColor = this.getColorOfZone(zone);

		zone.mapBlip.color = newColor;
		zone.label.text = labelText.replace(
			'%s',
			(zone.owner || 'N/A')?.toUpperCase()
		);

		mp.players.toCustomArray().forEach((player) => {
			player.callEvent('GangZones-UpdateZone', [
				zone.id,
				newColor,
				zone.status,
			]);
		});
	}

	private getZonesForClient() {
		return Array.from(this.zones.values()).map((zone) => {
			return {
				...zone,
				color: this.getColorOfZone(zone),
				owner: undefined,
			};
		});
	}

	private getColorOfZone({ owner }: { owner: string }) {
		return gangs[owner]?.blip?.color ?? 0;
	}

	private getInfo(player: Player) {
		const zones = Array.from(this.zones.values()).reduce(
			(amount, zone) =>
				zone.owner === player.faction ? amount + 1 : amount,
			0
		);
		return { zones, income: zones * this.income };
	}

	createZone(data: GangZoneModel, blip = false) {
		const { owner, position, radius, capturedAt } = data;
		const id = data._id.toString();
		const color = this.getColorOfZone({ owner });

		const mapBlip = mp.blips.new(
			313,
			new mp.Vector3(position.x, position.y, position.z),
			{
				name: 'Teritorija',
				color,
				shortRange: true,
			}
		);
		const label = mp.labels.new(
			labelText.replace('%s', (owner || 'N/A')?.toUpperCase()),
			new mp.Vector3(position.x, position.y, position.z),
			{
				font: 4,
				drawDistance: 10,
			}
		);

		if (blip) {
			mp.players.toCustomArray().forEach((player) => {
				player.callEvent('GangZones-CreateZone', {
					id,
					radius,
					position,
				});
			});
		}

		this.zones.set(id, {
			id,
			position,
			radius,
			owner,
			status: false,
			mapBlip,
			label,
			capturedAt,
		});
	}

	deleteZone(id: string) {
		if (!this.zones.has(id)) return;

		const zone = this.zones.get(id);

		mp.players.toCustomArray().forEach((player) => {
			player.callEvent('GangZones-DeleteZone', id);
		});

		if (zone?.mapBlip) zone.mapBlip.destroy();
		if (zone?.label) zone.label.destroy();

		this.zones.delete(id);
	}
}

export default new GangsZones();
