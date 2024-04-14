import JewelryData from 'data/jewelry-data.json';
import hud from 'helpers/hud';
import policeCalls from 'factions/police/calls';
import chat from 'basic/chat';
import { chatErrorMessages } from 'helpers/commands';

type ShopCase = {
	pos: PositionEx | Vector3Mp;
	prop: string;
	prop1: string;
	broken: boolean;
};

type AllowedWeapon = {
	name: string;
	chance: number;
};

const JewelryShopPosition = new mp.Vector3(-625.022, -232.825, 38.057);

class JewelryShop {
	private cases: Map<number, ShopCase> = new Map();

	constructor() {
		mp.events.subscribe(
			{
				'JewelryShop-SetCase': this.setCase.bind(this),
				'JewelryShop-Load': this.load.bind(this),
				'JewelryShop-Award': this.giveAward.bind(this),
			},
			false
		);

		this.init();
	}

	private load() {
		return {
			cases: Array.from(this.cases.values()),
			allowedWeapons: JewelryData.allowedWeapons as AllowedWeapon[],
		};
	}

	private setCase(player: Player, caseId: number, broken: boolean) {
		const shopCase = this.cases.get(caseId);

		if (!shopCase) {
			return;
		}

		// if (policeCalls.members()?.length < 7) {
		// 	hud.showNotification(
		// 		player,
		// 		'error',
		// 		'Trenutno nije moguće pljačkanje kase.'
		// 	);
		// 	return;
		// }

		shopCase.broken = broken;
		this.cases.set(caseId, shopCase);

		const jewelryRobCallout = policeCalls.getCall('zlatara');
		if (!jewelryRobCallout) {
			policeCalls.createCall({
				id: 'zlatara',
				message: 'Pljačka zlatare!',
				position: JewelryShopPosition,
			});

			// Notify all players
			chat.sendSystem(
				'U toku je pljačka zlatare! Molimo sve građane da budu na oprezu!',
				'0064b5',
				'** VANREDNE VESTI **'
			);
		}

		mp.players.toCustomArray().forEach((player) => {
			player.callEvent('JewelryShop-SetCase', [caseId, broken]);
		});
	}

	private giveAward(player: Player, caseId: number, chance: number) {
		const shopCase = this.cases.get(caseId);

		if (!shopCase) {
			return;
		}

		const playerBag = player.inventory.find((i) => i.name === 'bag');

		if (!playerBag) {
			hud.showNotification(player, 'error', 'Nemate torbu!', true);
			return;
		}

		if (!playerBag.data?.jewelry) {
			playerBag.data = {
				...playerBag.data,
				jewelry: 0,
			};
		}

		if (playerBag.data?.jewelry >= 20) {
			hud.showNotification(player, 'error', 'Torba ti je puna, nisi mogao uzeti nakit.', true);
			return;
		}

		const jewelryForPlayer = this.getRandomJewelryAmount(playerBag);
		playerBag.data.jewelry += jewelryForPlayer;

		player.mp.outputChatBox(
			chatErrorMessages.custom(
				'ZLATARA-ROB',
				`Uspešno je ukradeno ${playerBag.data.jewelry}/20 zlatnih predmeta.`
			)
		);
	}

	private getRandomJewelryAmount(bag: InventoryItem) {
		const randomInt = Math.floor(Math.random() * 5) + 1;

		if (bag.data?.jewelry + randomInt > 20) {
			return this.getRandomJewelryAmount(bag);
		}

		return randomInt;
	}

	private init() {
		mp.colshapes.create(JewelryShopPosition, 10, {
			onEnter: (player: Player) => {
				if (player.mp.weapon !== 2725352035 && !['lspd', 'lssd'].includes(player.faction)) {
					if (!policeCalls.checkCallouts(JewelryShopPosition))
						policeCalls.createCallout(
							player,
							{
								message: 'Upad u zlataru sa oružjem! (Tihi alarm)',
								position: JewelryShopPosition,
							},
							false
						);
				}
			},
		});

		const cases = JewelryData.cases as ShopCase[];

		cases.forEach((c, index) => {
			this.cases.set(index, c);
		});
	}
}

export default new JewelryShop();
