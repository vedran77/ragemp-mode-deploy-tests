import points from 'helpers/points';
import playerClothes, { ClothesName, components, props } from 'player/clothes';
import factions from 'factions';
import Faction from 'factions/faction';
import Wardrobe from './wardrobe';

type WardrobeItem = {
	id: ClothesName;
	drawable: number;
	texture: number;
};

class WardrobeCtrl {
	constructor() {
		mp.events.subscribe({
			'FactionWardrobe-WearItem': this.wearItem,
			'FactionWardrobe-Exit': this.onExit,
		});
	}

	create(position: PositionEx, wardrobe: Wardrobe, faction: Faction) {
		const point = points.create(
			position,
			1,
			{
				onKeyPress: wardrobe.showMenu,
			},
			{ color: [24, 132, 219, 100] }
		);
		faction.points.add(point);

		return wardrobe;
	}

	private wearItem(
		player: Player,
		wardrobeComponents: WardrobeItem[],
		reset?: boolean
	) {
		if (reset) {
			playerClothes.clear(player);
		}

		if (wardrobeComponents.length) {
			wardrobeComponents.forEach((item) => {
				playerClothes.set(player, item.id, {
					style: item.drawable,
					color: item.texture,
				});
			});
		}
	}

	private onExit(player: Player) {
		const faction = factions.getFaction(player.faction);

		if (!faction || !faction.isAlreadyAtWork(player)) {
			playerClothes.load(player);
		}

		// player.togglePrivateDimension();
		player.mp.setOwnVariable('inNativeUi', false);
	}
}

export { Wardrobe };

export default new WardrobeCtrl();
