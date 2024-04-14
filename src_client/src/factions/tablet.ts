import binder from 'utils/binder';
import scenarios from 'basic/scenarios';
import playerCtrl from 'player';

const player = mp.players.local;

class Tablet {
	private faction?: string;
	private menu = false;

	constructor() {
		binder.bind('tablet', 'Down', this.toggleMenu.bind(this), null);
	}

	canOpenMenu() {
		if (player.getVariable('inHand')) {
			return mp.game.ui.notifications.show('error', 'Sklonite predmet iz ruku');
		}

		return (
			!mp.gui.cursor.visible &&
			mp.browsers.hud &&
			!player.isFalling() &&
			!player.isSwimmingUnderWater() &&
			!player.isCuffed() &&
			!player.getVariable('isPlayingAnim') &&
			!player.getVariable('imprisoned') &&
			!player.getVariable('inNativeUi')
		);
	}

	private toggleMenu() {
		if (this.menu) {
			this.closeMenu();
		} else if (this.canOpenMenu()) {
			this.openMenu();
		}
	}

	private async openMenu() {
		if (!this.canOpenMenu()) return;

		const faction = player.getVariable('faction');
		const rank = await mp.events.callServer('Faction-GetPlayerRank');
		if (!faction || !rank) return;

		scenarios.playLocal('use_tablet');

		mp.browsers.showPage('factions/tablet', {
			user: { name: playerCtrl.getName(player), faction, rank },
			reset: this.faction !== faction,
		});
		mp.browsers.setHideBind(this.closeMenu);
		mp.game.ui.displayRadar(true);
		mp.gui.chat.show(true);

		this.faction = faction;
		this.menu = true;
	}

	private closeMenu() {
		scenarios.stopLocal();
		mp.browsers.hidePage();

		this.menu = false;
	}
}

const tablet = new Tablet();
