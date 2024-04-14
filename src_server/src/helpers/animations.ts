import walkingStyles from 'data/walking.json';
import moods from 'data/moods.json';
import { chatErrorMessages } from './commands';

class Animations {
	constructor() {
		mp.events.subscribeToDefault({
			setAnimation: this.set,
			playAnimation: this.playOnServer.bind(this),
			setWalkingStyle: this.setWalkingStyle,
			setMood: this.setMood,
			setScenario: this.setScenario,
			stopScenario: this.stopScenario,
		});

		mp.events.addCommands({
			anim: this.playAnimWithCommand.bind(this),
		});
	}

	private playAnimWithCommand(player: Player, animation: string) {
		if (!animation) {
			player.mp.outputChatBox(
				chatErrorMessages.error('/anim [ANIMACIJA]')
			);
			return;
		}

		player.callEvent('PlayerAnims-PlayCommand', animation);
	}

	playOnServer(
		entity: PlayerMp | Player,
		shortcut: string,
		duration?: number
	) {
		const player = 'mp' in entity ? entity.mp : entity;

		if (player.vehicle) return;

		player.setVariable('animation', shortcut);
		player.setOwnVariable('isPlayingAnim', true);

		if (duration) {
			mp.players.withTimeout(
				player,
				this.stopOnServer.bind(this, player),
				duration
			);
		}
	}

	stopOnServer(player: PlayerMp) {
		if (!player.getOwnVariable('isPlayingAnim')) return;

		player.setVariable('animation', null);
		player.setOwnVariable('isPlayingAnim', false);
	}

	setScenario(player: Player, name: string, onlyStream = false) {
		if (player.mp.getVariable('scenario')) return;

		if (onlyStream) {
			mp.players.callInStream(player.mp.position, 'Scenarios-Play', [
				player.mp,
				name,
			]);
		} else player.mp.setVariable('scenario', name);
	}

	stopScenario({ mp: player }: Player) {
		player.setVariable('scenario', null);
	}

	private set({ mp: player }: Player, data: string) {
		if (player.vehicle) return;

		player.setVariable('animation', data);
	}

	private setWalkingStyle({ mp: player }: Player, name: string) {
		const style = walkingStyles[name];

		player.setVariable('walking', style);
	}

	private setMood({ mp: player }: Player, name: string) {
		const anim = moods[name];

		player.setVariable('mood', anim);
	}
}

export default new Animations();
