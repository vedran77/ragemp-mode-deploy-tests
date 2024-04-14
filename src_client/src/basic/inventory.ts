import animations from 'helpers/animations';
import binder from 'utils/binder';

const player = mp.players.local;

class Inventory {
	private weaponHolsterAnim: Boolean = false;

	constructor() {
		mp.events.subscribe({
			'Inventory-ShowMenu': this.showMenu,
			'Inventory-SetCapacity': this.setCapacity,
		});

		mp.events.add('render', () => {
			if (this.weaponHolsterAnim) {
				mp.game.player.disableFiring(true);
			}
		});

		this.setBinds();
	}

	private showMenu(items: any[], cells: number, data: any) {
		mp.browsers.hidePage();

		const prop = data?.items ? 'storage' : 'equipment';

		mp.browsers.showPage('inventory', {
			items,
			cells,
			[prop]: data,
			gender: player.isMale() ? 'male' : 'female',
		});

		mp.game.graphics.transitionToBlurred(200);

		mp.browsers.setHideBind(() => mp.browsers.hidePage());
	}

	private useQuickItem(id: number) {
		if (!mp.browsers.hud || player.isCuffed() || player.isTypingInTextChat) return;

		const slot = `quick_${id}`;

		if (this.weaponHolsterAnim) return;

		if (!!player.getVariable(slot) && !player.getVariable('inHand')) {
			this.playHolsterAnim('pull_gun');

			setTimeout(() => {
				mp.events.callServer('Inventory-UseQuick', slot, false);
			}, 1000);
		} else if (!player.getVariable(slot) && !!player.getVariable('inHand')) {
			this.playHolsterAnim('put_gun');

			setTimeout(() => {
				mp.events.callServer('Inventory-ToQuick', [id, 'hands'], false);
			}, 1000);
		}
	}

	private removeFromHand() {
		if (!mp.browsers.hud || player.isTypingInTextChat || player.isCuffed() || !player.getVariable('inHand')) return;

		mp.events.callServer('Inventory-UnequipItem', 'hands', false);
	}

	private setCapacity(cells: number) {
		if (!mp.browsers.hud) {
			mp.events.callBrowser('Inventory-SetCapacity', [cells], false);
		}
	}

	private setBinds() {
		binder.bind('inventory', 'I', () => {
			if (!mp.browsers.hud || player.isCuffed()) return;

			mp.events.callServer('Inventory-ShowPlayerMenu', null, false);
		});

		binder.bind('inventory_hand', '0', this.removeFromHand);

		for (let index = 1; index <= 4; index++) {
			const name = `quick_${index}`;
			binder.bind(name, index.toString(), () => this.useQuickItem(index));
		}
	}

	private playHolsterAnim(anim: string) {
		this.weaponHolsterAnim = true;
		animations.play(player, anim);

		setTimeout(() => {
			animations.stop(player, anim);
			this.weaponHolsterAnim = false;
		}, 1500);
	}
}

const inventory = new Inventory();
