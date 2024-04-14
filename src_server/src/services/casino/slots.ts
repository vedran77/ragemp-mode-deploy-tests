import rpc from 'rage-rpc';
import hud from 'helpers/hud';
import _ from 'lodash';
import moneyManager from 'helpers/money';

const rulesPercentage = [
	{
		value: 0,
		pct: 1685,
	},
	{
		value: 2,
		pct: 200,
	},
	{
		value: 5,
		pct: 100,
	},
	{
		value: 25,
		pct: 10,
	},
	{
		value: 50,
		pct: 0,
	},
	{
		value: 75,
		pct: 0,
	},
	{
		value: 100,
		pct: 0,
	},
	{
		value: 250,
		pct: 0,
	},
	{
		value: 500,
		pct: 0,
	},
	{
		value: 1000,
		pct: 0,
	},
];

const rulesMap: { [key: number]: string[] } = {
	[0]: [],
	[2]: [],
	[5]: [],
	[25]: ['6-6-6', '2-2-2'],
	[50]: ['1-1-1'],
	[75]: ['3-3-3'],
	[100]: ['7-7-7'],
	[250]: ['0-0-0'],
	[500]: ['4-4-4'],
	[1000]: ['5-5-5'],
};

const rules: { [key: string]: number } = {
	'6-6-6': 25,
	'2-2-2': 25,
	'1-1-1': 25,
	'3-3-3': 25,
	'7-7-7': 25,
	'0-0-0': 25,
	'4-4-4': 25,
	'5-5-5': 25,
};

const slotMachineData = {
	rules,
	rulesMap,
	rulesPercentage,
};

class Slots {
	public slots: Map<number, PlayerMp>;

	constructor() {
		this.slots = new Map();
		mp.events.subscribe({
			'Casino:SlotsEnter': this.enter.bind(this),
			'Casino:SlotsRool': this.roll.bind(this),
			'Casino:SlotsExit': this.exit.bind(this),
		});
	}

	public verifySlot(id: number) {
		const q = this.slots.get(id);
		if (!q) return;
		if (mp.players.exists(q)) return;
		this.slots.delete(id);
	}

	public enter(player: PlayerMp, id: number): void | false {
		this.verifySlot(id);
		if (this.slots.get(id)) return false;
		this.slots.set(id, player);
	}

	public generateWin() {
		const winActions = _.shuffle(
			_.flatMap(slotMachineData.rulesPercentage, (winAction) => Array(winAction.pct).fill(winAction))
		);

		const winAction = winActions[Math.floor(Math.random() * winActions.length)];

		const winStrings = slotMachineData.rulesMap[winAction.value];
		const winString = winStrings[Math.floor(Math.random() * winStrings.length)];

		const rule = slotMachineData.rules[winString];

		return {
			winString,
			rule,
			isWinBet: typeof rule === 'number',
		};
	}

	public roll(player: Player, id: number, bet: number) {
		const money = player.money.cash;
		this.verifySlot(id);
		if (this.slots.get(id) != player.mp) return null;

		if (money < bet) {
			hud.showNotification(player, 'error', 'Nemate dovoljno novca.');
			return null;
		}

		moneyManager.change(player, 'cash', -bet, 'slots-bet');

		const { winString, rule, isWinBet } = this.generateWin();

		setTimeout(() => {
			if (player && mp.players.exists(player.mp) && this.slots.get(id) == player.mp) {
				if (isWinBet) {
					moneyManager.change(player, 'cash', bet * rule, 'slots-bet');
					hud.showNotification(player, 'success', `Dobili ste $${bet * rule}.`);
				} else {
					hud.showNotification(player, 'error', `Izgubili ste $${bet}.`);
				}
			}
		}, 5000);

		mp.players.forEach((p) => {
			const ent: Player = mp.players.get(p);
			ent.callEvent('casino:slots:rollVisual', [p.id, id, winString]);
		});

		return [winString, isWinBet];
	}

	public exit(player: Player, id: number) {
		this.verifySlot(id);
		const q = this.slots.get(id);
		if (!q) return;
		if (q.id !== player.mp.id) return;
		this.slots.delete(id);
	}
}

export default new Slots();
