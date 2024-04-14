import points from 'helpers/points';
import { Zone } from '../../gangs/zones';

type Team = {
	id: string;
	members: string[];
	alive: number;
};

class CaptureStrategy {
	public zone: Zone;
	private point: Point;

	private teams: {
		attacker: Team;
		defender: Team;
	};

	constructor(zone: Zone, attacker: string) {
		this.init(zone, attacker);
	}

	get attacker() {
		return this.teams.attacker;
	}

	get defender() {
		return this.teams.defender;
	}

	getPlayerTeam(player: Player) {
		const { attacker, defender } = this.teams;
		const { faction } = player;

		return attacker.id === faction
			? attacker
			: defender.id === faction
			? defender
			: null;
	}

	reset() {
		this.point.destroy();
	}

	private init(zone: Zone, attacker: string) {
		const point = points.create(
			zone.position,
			(zone.radius || 50) * 2,
			{
				onEnter: (player: Player) => this.zoneHandler(player, true),
				onExit: (player: Player) => this.zoneHandler(player, false),
			},
			{
				visible: false,
				color: [255, 0, 0, 120],
			}
		);

		this.zone = zone;
		this.point = point;

		const allPlayers = mp.players.toCustomArray().filter((player) => {
			return player.faction === attacker || player.faction === zone.owner;
		});

		allPlayers.forEach((player) => {
			point.showFor(player.mp);
		});

		this.teams = {
			attacker: {
				id: attacker,
				members: [],
				alive: 0,
			},
			defender: {
				id: zone.owner,
				members: [],
				alive: 0,
			},
		};
	}

	private zoneHandler(player: Player, enter: boolean) {
		if (!player) return;

		const team = this.getPlayerTeam(player);

		if (enter && !team.members.includes(player.dbId)) {
			team.members.push(player.dbId);
		}

		player.mp.setOwnVariable('inCaptureZone', enter);
		this.setTeamAlive(team, team.alive + (enter ? 1 : -1));
	}

	private setTeamAlive(team: Team, amount: number) {
		const { attacker, defender } = this.teams;

		team.alive = amount;

		const playersInZone = [...attacker.members, ...defender.members];

		playersInZone.forEach((dbId) => {
			const player = mp.players.getByDbId(dbId);

			if (!player) return;

			if (player.mp.colshape === this.point.id) {
				player.callEvent('GangCapture-ShowCaptureDialog', true);
				player.callEvent('GangCapture-UpdateMembers', [
					this.attacker.alive,
					this.defender.alive,
				]);
			} else {
				player.callEvent('GangCapture-ShowCaptureDialog', false);
			}
		});
	}
}

export default CaptureStrategy;
