import hud from 'helpers/hud';
import { Reward, luckyWheelRewards } from './rewards';
import money from 'helpers/money';

class CasinoWheel {
	private _antiSpam: number;
	private _spinInProgress: boolean;

	constructor() {
		mp.events.subscribe({
			'Casino:WheelSpinFinish': this.onWheelSpinFinish.bind(this),
		});
		this._spinInProgress = false;

		mp.colshapes.create(
			{
				x: 1111.052,
				y: 229.8579,
				z: -49.133,
			},
			1,
			{
				onEnter: (player: Player) => {
					hud.showInteract(player, 'E');
				},
				onKeyPress: (player: Player) => {
					if (this._spinInProgress) {
						hud.showNotification(player, 'error', 'Neko vec vrti tocak srece!');
						return;
					}

					if (Date.now() - this._antiSpam < 20000) {
						hud.showNotification(player, 'error', 'Sacekajte malo...');
						return;
					}

					this._spinInProgress = true;
					const stopsAt: number = Math.floor(Math.random() * 20);
					const reward: number = Math.floor(Math.random() * 100);

					player.mp.setVariable('LUCKY_WHEEL_CALL', true);
					player.mp.setVariable('LUCKY_WHEEL_WIN', stopsAt);
					player.mp.setVariable('LUCKY_WHEEL_FINAL_REWARD', reward);
					player.mp.stopAnimation();

					player.callEvent('Casino:PrepareForSpin', [stopsAt]);
					mp.players.forEachInRange(player.mp.position, 100, (p) => {
						if (p.id !== player.mp.id) {
							p.call('Casino:Spin', [stopsAt]);
						}
					});
				},
				onExit: (player: Player) => hud.showInteract(player),
			}
		);

		this._antiSpam = Date.now();
	}

	private onWheelSpinFinish(player: Player) {
		this._spinInProgress = false;
		const reward = this.getPlayerReward(player);

		hud.showNotification(player, 'success', `Nagrada: ${reward.type} ${reward.value}`);

		if (reward.type === 'money') {
			money.change(player, 'cash', reward.value, 'Tocak srece');

			hud.showNotification(player, 'success', `Dobili ste ${reward.value} novca!`);
		} else if (reward.type === 'gh-coin') {
			money.change(player, 'points', reward.value, 'Tocak srece');

			hud.showNotification(player, 'success', `Dobili ste ${reward.value} GH Coina!`);
		} else if (reward.type === 'car') {
			hud.showNotification(player, 'success', 'Dobili ste auto(treba implemetirati)!');
		} else if (reward.type === 'clothes') {
			hud.showNotification(player, 'success', 'Dobili ste odjecu(treba implemetirati)!');
		} else if (reward.type === 'bonus-spin') {
			hud.showNotification(player, 'success', 'Dobili ste dodatni spin(treba implemetirati)!');
		}
	}

	public getPlayerReward(player: Player): Reward {
		const rewardResult = player.mp.getVariable('LUCKY_WHEEL_FINAL_REWARD');
		const reward = luckyWheelRewards.find((r) => {
			if (typeof r.fromTo === 'number') {
				return r.fromTo === rewardResult;
			}
			return r.fromTo[0] <= rewardResult && r.fromTo[1] >= rewardResult;
		});

		return reward;
	}
}

export default new CasinoWheel();
