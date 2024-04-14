import animationsList from 'data/animations.json';
import targetAnimations from 'data/target-animations.json';

const anims = targetAnimations as {
	[category: string]: (AnimationData & { label: string })[];
};

type AnimationData = {
	dict: string;
	name: string;
	speed: number;
	flag: number;
	command?: string;
};

const localPlayer = mp.players.local;

class PlayerAnims {
	private activeAnimation: string | null = null;

	constructor() {
		mp.events.subscribe({
			'PlayerAnims-GetList': this.getList.bind(this),
			'PlayerAnims-SetAnim': this.setAnimation.bind(this),
			'PlayerAnims-PlayCommand': this.playCommand.bind(this),
		});

		mp.animations = this;

		mp.events.subscribeToDefault({
			render: () => {
				if (
					this.activeAnimation &&
					mp.game.controls.isControlPressed(0, 25) &&
					!animationsList[this.activeAnimation]
				) {
					this.stop(localPlayer, this.activeAnimation);
				}
			},
		});
	}

	isPlaying() {
		return !!this.activeAnimation;
	}

	playCommand(animation: string) {
		if (!animation) return;

		let iAnim = 0;
		let category = '';

		Object.keys(targetAnimations).forEach((key) => {
			const anim = targetAnimations[key].findIndex(
				(a: AnimationData) => a?.command === animation
			);

			if (anim !== -1) {
				iAnim = anim;
				category = key;
			}
		});

		if (category && iAnim !== -1) {
			this.setAnimation(category, iAnim);
		}
	}

	async play(player: PlayerMp, animation: string) {
		const data: AnimationData =
			animationsList[animation] ?? this.getFromHash(animation);
		if (!data || !data.dict || !mp.players.exists(player) || !player.handle)
			return;

		const { dict, name, speed, flag } = data;

		mp.game.streaming.requestAnimDict(dict);
		while (!mp.game.streaming.hasAnimDictLoaded(dict))
			await mp.game.waitAsync(0);

		this.activeAnimation = animation;
		player.taskPlayAnim(
			dict,
			name,
			speed,
			1,
			-1,
			flag,
			0.0,
			false,
			false,
			false
		);
	}

	stop(player: PlayerMp, animation: string) {
		const data: AnimationData =
			animationsList[animation] ?? this.getFromHash(animation);

		this.activeAnimation = null;

		if (data && mp.players.exists(player)) {
			player.stopAnimTask(data.dict, data.name, 3.0);
		}
	}

	private setAnimation(category: string, id?: number) {
		if (localPlayer.isCuffed()) return;

		const animation = anims[category] ? anims[category][id] : null;
		const hash = animation && this.createHash(animation);

		mp.events.callRemote('setAnimation', hash);
	}

	private createHash(data: AnimationData) {
		const { dict, name, flag, speed } = data;

		return `${dict}%${name}%${speed}%${flag}`;
	}

	private getFromHash(hash: string) {
		const animation = hash ? hash.split('%') : [];

		return (
			animation.length >= 4 && {
				dict: animation[0],
				name: animation[1],
				speed: +animation[2],
				flag: +animation[3],
			}
		);
	}

	private getList(category: string) {
		const items = anims[category];

		return items && items.map((item) => item.label);
	}
}

export default new PlayerAnims();
