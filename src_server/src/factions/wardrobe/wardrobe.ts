import { ClothesName } from 'player/clothes';

export type Clothes = {
	[gender in Player['gender']]: {
		[name in ClothesName]?: (
			| [number, number, ClothesName]
			| [number, number]
		)[];
	};
};

class FactionWardrobe {
	showMenu(player: Player) {
		if (!player.faction || player.mp.getOwnVariable('inNativeUi')) return;

		// player.togglePrivateDimension();
		player.mp.setOwnVariable('inNativeUi', true);

		player.callEvent('FactionWardrobe-ShowMenu');
	}
}

export default FactionWardrobe;
