import { chatErrorMessages } from 'helpers/commands';
import roadblocks from 'data/roadblocks.json';
import Roadblock from 'models/Roadblocks';
import SpamResistor from 'basic/cooldown';
import hud from 'helpers/hud';

type RoadBlock = {
	type: keyof typeof roadblocks | 'point';
	position: Vector3Mp;
	heading: number;
	creator: string;
	dbId?: string;
	object?: number;
	colshape?: number | null;
	speed?: number;
};

class PoliceRoadBlocks {
	private roadblocks: RoadBlock[] = [];
	private spamResistor = new SpamResistor(1000);

	constructor() {
		mp.events.addCommands({
			rb: this.createRoadblock.bind(this),
			rrb: this.deleteRoadblock.bind(this),
		});
	}

	playAnimation(player: Player, dict: string, name: string) {
		player.mp.playAnimation(dict, name, -1, 47);

		setTimeout(() => {
			player.mp.stopAnimation();
		}, 2000);
	}

	private async createRoadblock(player: Player, data: string) {
		if (!['lspd', 'lssd', 'lsfd'].includes(player.faction)) return;

		if (player.mp.vehicle && !data.includes('point')) {
			player.mp.outputChatBox(chatErrorMessages.error('Morate biti van vozilu!'));
			return;
		}

		const args = data?.split(' ');

		if (!args || args.length < 1) {
			player.mp.outputChatBox(chatErrorMessages.error('/rb [type]'));
			player.mp.outputChatBox(
				chatErrorMessages.info(
					Object.keys(roadblocks)
						.filter((key) => {
							const roadblock = roadblocks[key as keyof typeof roadblocks];

							return roadblock.authorities.includes(player.faction);
						})
						.join(', ')
				)
			);
			return;
		}

		const type = args[0];
		if (type === 'point') {
			if (type === 'point' && (!args?.[1] || !args?.[2])) {
				player.mp.outputChatBox(chatErrorMessages.error(`/rb point ${args?.[1] || '[RADAR ID]'} [SPEED]`));
				player.mp.outputChatBox(
					chatErrorMessages.info(
						'Tip "point" se koristi za uspostavljanje pointa za radar. Ukoliko se ne postavi radar nece funkcionisati!'
					)
				);
				return;
			}

			this.createRadarPoint(player, parseInt(args?.[1]), parseInt(args?.[2]));
			return;
		}

		const roadblock = roadblocks[type.toLowerCase() as keyof typeof roadblocks];
		if (!roadblock) {
			player.mp.outputChatBox(chatErrorMessages.error('Pogrešan tip roadblocka!'));
			return;
		}

		if (roadblock.authorities && !roadblock.authorities.includes(player.faction)) {
			player.mp.outputChatBox(chatErrorMessages.error('Nemate ovaj roadblock!'));
			return;
		}

		const { position, heading } = player.mp;

		// let rbData;
		// if (type === 'radar') {
		//   rbData = await Roadblock.create({
		//     type: type,
		//     position: {
		//       x: position.x,
		//       y: position.y,
		//       z: position.z,
		//     },
		//     heading: heading,
		//     speed,
		//     creator: player.dbId,
		//   });
		// }

		if (type === 'radar') {
			player.mp.outputChatBox(
				chatErrorMessages.info(
					'Sada je potrebno kreirati tip "point". Ukoliko se ne postavi radar nece funkcionisati!'
				)
			);
		}

		const colshape = this.createRoadblockColshape(type, position);

		this.playAnimation(player, 'anim@narcotics@trash', 'drop_front');

		setTimeout(() => {
			this.createRoadblockObject(type, position, heading, player.dbId, colshape);

			player.mp.outputChatBox(chatErrorMessages.info(`Kreiran je roadblock: ${this.roadblocks.length - 1}`));
		}, 1000);
	}

	private async deleteRoadblock(player: Player) {
		if (!this.spamResistor.isEnded(player)) {
			return hud.showNotification(player, 'error', 'Sačekajte malo!', true);
		}

		if (!['lspd', 'lssd', 'lsfd'].includes(player.faction)) return;

		if (player.mp.vehicle) {
			player.mp.outputChatBox(chatErrorMessages.error('Morate biti van vozilu!'));
			return;
		}

		const position = player.mp.position;
		const roadblocks = this.roadblocks;

		const rbIndex = roadblocks.findIndex((rb) => {
			const distance = Math.sqrt(
				Math.pow(position.x - rb.position.x, 2) +
					Math.pow(position.y - rb.position.y, 2) +
					Math.pow(position.z - rb.position.z, 2)
			);

			return distance < 2;
		});
		const roadblock = roadblocks[rbIndex];

		if (!roadblock) {
			player.mp.outputChatBox(chatErrorMessages.error('Nema roadblocka u blizini!'));
			return;
		}

		const rbAuthorities = roadblocks[roadblock.type]?.authorities;
		if (rbAuthorities && !rbAuthorities.includes(player.faction)) {
			player.mp.outputChatBox(chatErrorMessages.error('Ne možete pokupiti ovaj roadblock!'));
			return;
		}

		this.playAnimation(player, 'weapons@first_person@aim_rng@generic@projectile@thermal_charge@', 'plant_floor');

		if (roadblock.colshape) {
			const colshape = mp.colshapes[roadblock.colshape];

			if (colshape) {
				colshape.destroy();
			}
		}

		if (roadblock.object) {
			const object = mp.objects[roadblock.object];

			if (object) {
				object.destroy();
			}
		}

		this.roadblocks = this.roadblocks.filter((rb, index) => index !== rbIndex);

		player.mp.outputChatBox(chatErrorMessages.info(`Obrisan je roadblock: ${rbIndex}`));

		// Cooldown
		this.spamResistor.apply(player);

		// if (roadblock.type === 'radar') {
		//   await Roadblock.deleteOne({ _id: roadblock.dbId });
		// }
	}

	private createRoadblockObject(
		type: string,
		position: Vector3Mp,
		heading: number,
		creator: string,
		colshape?: ColshapeMp,
		dbId?: string
	) {
		const roadblock = roadblocks[type.toLowerCase() as keyof typeof roadblocks];

		if (type !== 'radar') {
			position.z -= 0.95;
		}

		const object = mp.objects.new(mp.joaat(roadblock.object), position, {
			rotation: new mp.Vector3(0, 0, (heading + 180) % 360),
			dimension: 0,
			alpha: 255,
		});

		this.roadblocks.push({
			type: type.toLowerCase() as keyof typeof roadblocks,
			position,
			heading,
			creator,
			dbId,
			object: object.id,
			colshape: (colshape && colshape.id) || null,
		});

		return object;
	}

	private createRoadblockColshape(type: string, position: Vector3Mp) {
		let colshape: ColshapeMp | null = null;
		if (type === 'spike') {
			colshape = mp.colshapes.newSphere(position.x + 2, position.y, position.z, 3);
		}

		if (!colshape) return;

		mp.events.add('playerEnterColshape', (player, shape) => {
			if (shape == colshape && player.vehicle) {
				if (type === 'spike') player.call('Vehicle-DamageTyre', [player.vehicle]);
			}
		});

		return colshape;
	}

	private createRadarPoint(player: Player, id: number, speed: number) {
		if (!['lspd', 'lssd', 'lsfd'].includes(player.faction)) return;

		const roadblock = this.roadblocks[id];
		if (!roadblock || roadblock.type !== 'radar') {
			player.mp.outputChatBox(chatErrorMessages.error('Nema ovog radara!'));
			return;
		}

		let position = player.mp?.vehicle?.position || player.mp.position;

		if (roadblock?.colshape) mp.colshapes.at(roadblock.colshape).destroy();

		const colshape = mp.colshapes.newSphere(position.x, position.y, position.z, 10);
		roadblock.colshape = colshape.id;
		roadblock.speed = speed;

		mp.events.add('playerEnterColshape', (player, shape) => {
			if (shape == colshape && player.vehicle) {
				if (roadblock.type === 'radar') player.call('Vehicle-RadarSpeeding', [player.vehicle, roadblock.speed]);
			}
		});

		setTimeout(() => {
			player.mp.outputChatBox(chatErrorMessages.info(`Postavljen je point za roadblock: ${id}`));
		}, 1000);
	}

	async load() {
		const roadblocks = await Roadblock.find().lean();

		roadblocks.forEach((roadblock) => {
			const { type, position, heading, speed, creator } = roadblock;

			const { x, y, z } = position;

			const colshape = this.createRoadblockColshape(type, new mp.Vector3(x, y, z));

			this.createRoadblockObject(type, new mp.Vector3(x, y, z), heading, creator, colshape, roadblock._id);
		});
	}
}

export default new PoliceRoadBlocks();
