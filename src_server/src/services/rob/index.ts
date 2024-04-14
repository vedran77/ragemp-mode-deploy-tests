import hud from 'helpers/hud';
import './fleeca-bank';
import './jewelry-shop';
import './market';

mp.events.subscribe({
	'Rob:PlayerBag': (player: Player, type: 'jewelry' | 'money') => {
		const playerBag = player.inventory.find((i) => i.name === 'bag');

		if (!playerBag) {
			hud.showNotification(player, 'error', 'Nemate torbu!', true);
			return null;
		}

		if ((type === 'money' && playerBag.data?.jewelry) || (type === 'jewelry' && playerBag.data?.money)) {
			hud.showNotification(
				player,
				'error',
				`U torbi vec imate ${playerBag.data?.money ? 'prljav novac' : 'ukradeno zlato'}!`,
				true
			);
			return null;
		}

		if (type === 'jewelry') return (playerBag.data?.jewelry || 0) < 20;
		else if (type === 'money') return (playerBag.data?.money || 0) < 2000;
	},
});
