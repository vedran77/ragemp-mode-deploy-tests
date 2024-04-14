import hud from 'helpers/hud';

class FleecaBankHacking {
	constructor() {
		mp.events.subscribe({
			'CircuitBreaker-Win': this.onCircuitBreakerWin.bind(this),
			'CircuitBreaker-Lose': this.onCircuitBreakerLose.bind(this),
			'CircuitBreaker-Start': this.start.bind(this),
		});
	}

	private onCircuitBreakerWin(player: Player) {
		const index = player.mp.getVariable('fleeca-bank');

		if (index < 0) {
			hud.showNotification(player, 'error', 'Nisi u blizini banke!');
			return;
		}

		mp.players.toCustomArray().forEach((p: Player) => {
			p.callEvent('FleecaBank-UpdateSafeStatus', [index, true], false);
		});
	}

	private onCircuitBreakerLose(player: Player) {
		hud.showNotification(player, 'error', 'Nisi uspeo da hakujes sistem el. brave!', true);
		// player.mp.setVariable('fleeca-bank', null);
	}

	start(player: Player, task: 'safe' | 'cell') {
		const index = player.mp.getVariable('fleeca-bank');

		if (task === 'safe') {
			player.mp.call('CircuitBreakerStart', [
				1,
				1,
				1,
				{
					onWin: 'CircuitBreaker-Win',
					onLose: 'CircuitBreaker-Lose',
				},
			]);

			// player.callEvent('FleecaBank-StartHacking', index);
		} else if (task === 'cell') {
			player.callEvent('FleecaBank-PlantBomb', index);
		}
	}
}

export default new FleecaBankHacking();
