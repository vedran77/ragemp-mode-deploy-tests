import rpc from 'rage-rpc';
import hud from 'helpers/hud';
import { banks } from './data';
import policeCalls from 'factions/police/calls';
import { chatErrorMessages } from 'helpers/commands';

import Hacking from './hacking';
import chat from 'basic/chat';

type Bank = {
	safeColshape: number;
	safeStatus?: boolean;
	cellColshapes: number[];
	cellStatuses?: boolean[];
	mainColshape: number;
	bankStatus?: 'opened' | 'closed' | 'robbed';
	loots?: boolean[];
};

class FleecaBank {
	private banks: Bank[] = [];

	constructor() {
		mp.events.subscribe(
			{
				'FleecaBank-GetAll': this.getAll.bind(this),
				'FleecaBank-BombDone': this.bombDone.bind(this),
				'FleecaBank-UpdateUser': this.updateUser.bind(this),
				'FleecaBank-Award': this.giveAward.bind(this),
			},
			false
		);

		this.init();
	}

	private updateUser(player: Player, value: number | string | number[], type: 'loot' | 'hack' | 'bomb') {
		switch (type) {
			case 'loot':
				player.mp.setVariable('bank-rob-loot', value);
				mp.players.callInStream(player.mp.position, 'FleecaBank-PlayLootTask', [player.mp, value]);
				break;
			case 'hack':
				player.mp.setVariable('bank-rob-hack', value);
				break;
			case 'bomb':
				player.mp.setVariable('bank-rob-bomb', value);
				mp.players.callInStream(player.mp.position, 'FleecaBank-PlayPlantTask', [player.mp, ...value]);
				break;
		}
	}

	private bombDone(player: Player, bankIndex: number, cellIndex: number) {
		const bank = this.banks[bankIndex];

		if (!bank) {
			return;
		}

		bank.cellStatuses[cellIndex] = true;

		if (bank.cellStatuses.every((status) => status === true)) bank.bankStatus = 'opened';
	}

	private giveAward(player: Player, bankIndex: number, lootIndex: number) {
		const bank = this.banks[bankIndex];

		if (!bank) {
			return;
		}

		const playerBag = player.inventory.find((i) => i.name === 'bag');

		if (!playerBag) {
			hud.showNotification(player, 'error', 'Nemate torbu!', true);
			return;
		}

		if (!playerBag.data?.money) {
			playerBag.data = {
				...playerBag.data,
				money: 0,
			};
		}

		if (playerBag.data?.money >= 2000) {
			hud.showNotification(player, 'error', 'Torba ti je puna, nisi mogao uzeti nakit.', true);
			return;
		}

		const money = Math.floor(Math.random() * 1000) + 20000;
		playerBag.data.money += money;
		bank.loots[lootIndex] = true;

		player.mp.outputChatBox(chatErrorMessages.custom('BANKA-ROB', `Uspešno ste ukrali $${money}.`));
	}

	private getAll() {
		return this.banks.map((bank, index) => {
			const bankData = banks[index];

			return {
				safe: {
					position: bankData.safe,
					status: bank.safeStatus,
				},
				cells: bankData.cells.map((cell, index) => ({
					position: cell,
					status: bank.cellStatuses[index],
				})),
				bankStatus: bank.bankStatus,
			};
		});
	}

	private createColshape(position: PositionEx, type: 'safe' | 'cell', index: number) {
		const onKeyPress = async (
			player: Player,
			data: {
				type: 'safe' | 'cell';
				index: number;
			}
		) => {
			if (type !== data.type || index !== data.index) {
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

			if (this.banks[index].bankStatus === 'robbed') {
				hud.showNotification(player, 'error', 'Banka je vec opljačkana!');
				return;
			}

			if (this.banks[index].bankStatus === 'closed') {
				Hacking.start(player, data.type);

				const bankRobCallout = policeCalls.getCall(`banka-${index}`);
				if (!bankRobCallout) {
					policeCalls.createCall({
						id: `banka-${index}`,
						message: 'Pljačka banke!',
						position: new mp.Vector3(position.x, position.y, position.z),
					});

					const { zone, street } = await rpc.callClient(
						player.mp,
						'getLocationByCoords',
						new mp.Vector3(position.x, position.y, position.z)
					);

					// Notify all players
					chat.sendSystem(
						`U toku je pljačka banke na lokaciji: ${street}(${zone})! Molimo sve građane da budu na oprezu!`,
						'0064b5',
						'** VANREDNE VESTI **'
					);
				}
			}
		};

		const onEnter = (player: Player, data: { type: 'safe' | 'cell'; index: number }) => {
			if (type !== data.type || index !== data.index) {
				return;
			}

			player.mp.setVariable('fleeca-bank', index);
			hud.showInteract(player, 'E');
		};

		const onExit = (player: Player, data: { type: 'safe' | 'cell'; index: number }) => {
			hud.showInteract(player);
		};

		const colshape = mp.colshapes.create(
			position,
			1,
			{
				onEnter,
				onExit,
				onKeyPress,
			},
			{
				data: {
					type,
					index,
				},
			}
		);

		return colshape;
	}

	private init() {
		banks.forEach((bank, index) => {
			const safeColshape = this.createColshape(bank.safe, 'safe', index);

			const cellColshapes = bank.cells.map((cell) => {
				const cellColshape = this.createColshape(cell, 'cell', index);

				return cellColshape.id;
			});

			const mainColshape = mp.colshapes.create(bank.safe, 10, {
				onEnter: (player: Player) => {
					// if (player.mp.weapon !== 2725352035  && !['lspd', 'lssd'].includes(player.faction)) {
					if (player.mp.weapon !== 2725352035) {
						if (!policeCalls.checkCallouts(new mp.Vector3(bank.safe.x, bank.safe.y, bank.safe.z)))
							policeCalls.createCallout(
								player,
								{
									message: 'Upad u banku sa oružjem! (Tihi alarm)',
									position: new mp.Vector3(bank.safe.x, bank.safe.y, bank.safe.z),
								},
								false
							);
					}
				},
			});

			this.banks.push({
				safeColshape: safeColshape.id,
				cellColshapes: cellColshapes,
				bankStatus: 'closed',
				cellStatuses: new Array(bank.cells.length).fill(false),
				safeStatus: false,
				mainColshape: mainColshape.id,
				loots: new Array(bank.loots).fill(false),
			});
		});
	}
}

export default new FleecaBank();
