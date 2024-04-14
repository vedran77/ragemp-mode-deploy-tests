import hud from 'helpers/hud';
import money from 'helpers/money';
import inventoryHelper from 'basic/inventory/helper';
import clothes from 'player/clothes';

class BlackMarketSell {
	constructor() {
		mp.events.subscribe({
			'BlackMarket-Sell': this.sellItem.bind(this),
		});
	}

	public async sellItem(player: Player) {
		const inventory = player.inventory;
		const item = inventory.find(
			(item) => item.name === 'bag' && item?.data?.jewelry > 0
		);

		if (!item || !item?.data?.jewelry || item.data.jewelry <= 0) {
			hud.showNotification(player, 'error', 'Nemate nakit za prodaju!');
			return;
		}

		const price =
			item.data.jewelry *
			(Math.floor(Math.random() * (1100 - 900 + 1)) + 900);

		await money.change(player, 'cash', price, 'black-market-sell-jewelry');
		inventoryHelper.removeItem(inventory, item);

		clothes.hide(player, 'bag');

		hud.showNotification(
			player,
			'success',
			`Prodao si sav nakit za $${price}!`
		);
	}
}

export default new BlackMarketSell();
