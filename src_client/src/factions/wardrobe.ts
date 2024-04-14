import hud from 'basic/hud';
import GovOutfits from 'data/gov-outfit-presets.json';
import * as NativeUi from 'libs/nativeui';

// NativeUI
const Menu = NativeUi.Menu;
const UIMenuItem = NativeUi.UIMenuItem;
const UIMenuCheckboxItem = NativeUi.UIMenuCheckboxItem;
const Point = NativeUi.Point;

type OutfitVariant = {
	name: string;
	gender: string;
	category: string;
	components: {
		[name: string]: number[];
	};
};

const player = mp.players.local;
let wardrobeMenu: NativeUi.Menu | null = null;

const componentToArray = (component: string) => {
	const [drawable, texture] = component.split(':');

	return [parseInt(drawable) - 1, parseInt(texture) - 1];
};

class FactionWardrobe {
	constructor() {
		mp.events.subscribe({
			'FactionWardrobe-ShowMenu': this.showMenu.bind(this),
		});
	}

	private buildMenu() {
		const faction = player.getVariable('faction');
		const onDuty: boolean = player.getVariable('factionWork');
		const playerGender = player.isMale() ? 'male' : 'female';

		const items: OutfitVariant[] = Object.entries(GovOutfits)
			.filter(
				([_, value]) =>
					value.gender.toLowerCase() === playerGender &&
					value.category2.toLowerCase() === faction
			)
			.map(([key, value]) => ({
				name: key,
				gender: value.gender,
				category: (('category3' in value && value.category3) ||
					'Uniforms') as string,
				components: {
					hat: componentToArray(value.hat),
					glasses: componentToArray(value.glasses),
					ears: componentToArray(value.ears),
					watch: componentToArray(value.watch),
					mask: componentToArray(value.mask),
					shirt: componentToArray(value.shirt),
					torso: componentToArray(value.torso),
					decals: componentToArray(value.decals),
					undershirt: componentToArray(value.undershirt),
					pants: componentToArray(value.pants),
					shoes: componentToArray(value.shoes),
					accessories: componentToArray(value.accessories),
					armor: componentToArray(value.armor),
					bag: componentToArray(value.bag),
				},
			}));

		if (!wardrobeMenu) {
			wardrobeMenu = new Menu(
				'GOV Uniforme',
				`Tvoja organizacija: ${faction?.toUpperCase()}`,
				new Point(50, 50),
				'commonmenu',
				'interaction_bgd'
			);
			wardrobeMenu.Close();
		}

		wardrobeMenu.AddItem(
			new UIMenuItem('Uniforme', 'Odaberi uniformu koju zelis da obuces')
		);

		if (['lspd', 'lssd'].includes(faction)) {
			wardrobeMenu.AddItem(
				new UIMenuItem('Traffic Vest', 'Florescentni prsluk')
			);
		}

		let wardrobeDivisionSubMenu = new Menu(
			'GOV Divizije',
			`Tvoja organizacija: ${faction?.toUpperCase()}`,
			new Point(50, 50),
			'commonmenu',
			'interaction_bgd'
		);
		wardrobeDivisionSubMenu.Close();

		const divisions = items.reduce((acc, item) => {
			if (!acc.includes(item.category)) acc.push(item.category);

			return acc;
		}, []);

		const divisionSubMenus = {};
		divisions.forEach((division) => {
			wardrobeDivisionSubMenu.AddItem(
				new UIMenuItem(division, 'Odaberi diviziju')
			);

			divisionSubMenus[division] = new Menu(
				division,
				`Tvoja organizacija: ${faction?.toUpperCase()}`,
				new Point(50, 50),
				'commonmenu',
				'interaction_bgd'
			);
			divisionSubMenus[division].Close();

			const divisionItems = items.filter(
				(item) => item.category === division
			);

			divisionItems.forEach((item) => {
				divisionSubMenus[division].AddItem(
					new UIMenuItem(item.name, 'Odaberi uniformu')
				);
			});

			divisionSubMenus[division].ItemSelect.on(async (item) => {
				const outfit = divisionItems.find(
					(outfit) => outfit.name === item.Text
				);

				if (!outfit) return;

				const components = Object.entries(outfit.components).map(
					([key, values]) => ({
						id: key,
						drawable: values[0],
						texture: values[1],
					})
				);

				await mp.events.callServer('FactionWardrobe-WearItem', [
					components,
					true,
				]);
			});

			wardrobeDivisionSubMenu.BindMenuToItem(
				divisionSubMenus[division],
				wardrobeDivisionSubMenu.MenuItems.find(
					(item) => item.Text === division
				)
			);
		});

		wardrobeMenu.BindMenuToItem(
			wardrobeDivisionSubMenu,
			wardrobeMenu.MenuItems[0]
		);

		wardrobeMenu.AddItem(
			new UIMenuCheckboxItem(
				'Duznost:',
				onDuty,
				'Ukljuci/iskljuci duznost'
			)
		);

		wardrobeMenu.AddItem(new UIMenuItem('Zatvori', 'Zatvori meni'));

		wardrobeMenu.CheckboxChange.on(async (item, checked) => {
			if (item.Text === 'Duznost:') {
				if (checked) await mp.events.callServer('Factions-StartWork');
				else await mp.events.callServer('Factions-FinishWork');
			}
		});

		wardrobeMenu.ItemSelect.on(async (item) => {
			if (item.Text === 'Zatvori') {
				wardrobeMenu.Close();
				this.closeMenu();
			} else if (item.Text === 'Traffic Vest') {
				await mp.events.callServer('FactionWardrobe-WearItem', [
					[
						{
							id: 'armor',
							drawable: playerGender === 'male' ? 21 : 19,
							texture: faction === 'lspd' ? 0 : 1,
						},
					],
				]);
			}
		});

		wardrobeMenu.MenuClose.on(() => {
			wardrobeMenu = null;

			this.closeMenu();
		});
	}

	private showMenu() {
		hud.visible = false;
		mp.gui.cursor.visible = false;
		mp.gui.chat.show(false);
		// player.setVariable('inNativeUi', true);

		if (!wardrobeMenu) this.buildMenu();

		if (!wardrobeMenu && !wardrobeMenu.Visible) return;

		player.freezePosition(true);

		wardrobeMenu.Open();
	}

	private async closeMenu() {
		await mp.events.callServer('FactionWardrobe-Exit');

		player.freezePosition(false);

		hud.visible = true;
		mp.gui.cursor.visible = false;
		mp.gui.chat.show(true);
		// player.setVariable('inNativeUi', false);
	}
}

export default new FactionWardrobe();
