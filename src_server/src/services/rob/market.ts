import cryptoRandomString from 'crypto-random-string';
import inventory from 'basic/inventory/helper';
import CashRegisters from 'data/market-rob/cashRegisters.json';
import hud from 'helpers/hud';
import animations from 'helpers/animations';
import money from 'helpers/money';
import { chatErrorMessages } from 'helpers/commands';
import { xyInFrontOfPos } from 'utils/vectors';
import policeCalls from 'factions/police/calls';

type CashRegister = {
	state: 'normal' | 'emptied';
	position: Vector3Mp;
	rotation: number;
	colshape?: ColshapeMp;
	object?: number;
	cash?: number;
	robbedAt?: number;
};

const robInterval = 60 * 60 * 1000;

class MarketRobbery {
	private cashRegisters: Map<number, CashRegister>;

	constructor() {
		this.cashRegisters = new Map();

		mp.events.subscribe({
			'CashRegister-Success': this.robSuccess.bind(this),
			'CashRegister-Error': this.robError.bind(this),
		});

		this.load();
	}

	private async robSuccess(player: Player, cashRegisterId: number) {
		if (!cashRegisterId) {
			return;
		}

		const cashRegister = this.cashRegisters.get(cashRegisterId);

		if (!cashRegister) {
			return;
		}

		hud.showNotification(player, 'success', 'Opljačkali ste kasu!');

		const currentObject = mp.objects.at(cashRegister.object);
		const object = mp.objects.new('prop_till_01_dam', currentObject.position, {
			rotation: currentObject.rotation,
		});

		animations.stopScenario(player);
		animations.playOnServer(player.mp, 'take_from_cash_register', 10000);

		setTimeout(async () => {
			player.mp.outputChatBox(
				chatErrorMessages.custom('PLJAČKA', `Opljačkali ste kasu, ukrali ste $${cashRegister.cash}.`)
			);

			currentObject.destroy();
			cashRegister.object = object.id;

			await money.change(player, 'cash', cashRegister.cash, 'rob cash register');

			cashRegister.cash = 0;
			cashRegister.robbedAt = Date.now();

			this.cashRegisters.set(cashRegisterId, cashRegister);

			// animations.stopOnServer(player.mp);
		}, 10000);
	}

	private robError(player: Player, cashRegisterId: number) {
		if (!cashRegisterId) return;

		const cashRegister = this.cashRegisters.get(cashRegisterId);

		if (!cashRegister) {
			return;
		}

		hud.showNotification(player, 'error', 'Niste uspeli da opljačkate kasu, probajte ponovo!');

		cashRegister.state = 'normal';
		this.cashRegisters.set(cashRegisterId, cashRegister);

		animations.stopScenario(player);
	}

	private async startRob(player: Player, { cashRegisterId }: { cashRegisterId: number }) {
		const cashRegister = this.cashRegisters.get(cashRegisterId);
		const lockpick = player.inventory.find((item) => item.name === 'lockpick');

		if (!cashRegister) {
			return;
		}

		// if (policeCalls.members()?.length < 4) {
		// 	hud.showNotification(
		// 		player,
		// 		'error',
		// 		'Trenutno nije moguće pljačkanje kase.'
		// 	);
		// 	return;
		// }

		if (!lockpick || lockpick.amount < 1) {
			hud.showNotification(player, 'error', 'Potreban vam je alat za otvaranje.');
			return;
		}

		if (cashRegister.state === 'emptied') {
			hud.showNotification(player, 'error', 'Kasa je već opljačkana.');
			return;
		}

		if (!cashRegister.cash) {
			hud.showNotification(player, 'error', 'Kasa je prazna.');
			return;
		}

		// animations.playOnServer(player.mp, 'rob_cash_register', 8000);
		lockpick.amount -= 1;
		if (lockpick.amount < 1) {
			inventory.removeItem(player.inventory, lockpick);
		}

		animations.setScenario(player, 'pick_cash_register');

		if (!policeCalls.checkCallouts(cashRegister.position))
			policeCalls.createCallout(
				player,
				{
					id: `mr${cashRegister.object}`,
					message: 'Prijava pljačke radnje',
					position: cashRegister.position,
				},
				false
			);

		cashRegister.state = 'emptied';
		this.cashRegisters.set(cashRegisterId, cashRegister);

		player.callEvent('Lockpick-ShowMenu', [
			cashRegisterId,
			{
				onSuccess: 'CashRegister-Success',
				onError: 'CashRegister-Error',
				onCancel: 'CashRegister-Error',
			},
			4,
		]);
	}

	private createCashRegister(cashRegister: CashRegister) {
		const object = mp.objects.new('prop_till_01', cashRegister.position, {
			rotation: new mp.Vector3(0.0, 0.0, cashRegister.rotation),
		});

		const cashRegisterId = this.generateId();

		cashRegister.colshape = mp.colshapes.create(
			xyInFrontOfPos(cashRegister.position, cashRegister.rotation, -0.5),
			0.5,
			{
				onKeyPress: this.startRob.bind(this),
			},
			{
				data: {
					cashRegisterId,
				},
			}
		);

		cashRegister.object = object.id;
		cashRegister.cash = Math.floor(Math.random() * (2000 - 300)) + 300;

		this.cashRegisters.set(cashRegisterId, cashRegister);
	}

	private resetCashRegister(id: number) {
		const cashRegister = this.cashRegisters.get(id);

		const currentObject = mp.objects.at(cashRegister.object);
		const object = mp.objects.new('prop_till_01', currentObject.position, {
			rotation: currentObject.rotation,
		});

		currentObject.destroy();
		cashRegister.object = object.id;

		cashRegister.state = 'normal';
		cashRegister.cash = Math.floor(Math.random() * (2000 - 300)) + 300;

		this.cashRegisters.set(id, cashRegister);
	}

	private generateId(): number {
		const id = Number(cryptoRandomString({ length: 10, type: 'numeric' }));

		if (this.cashRegisters.has(id)) {
			return this.generateId();
		}

		return id;
	}

	async load() {
		CashRegisters.forEach((cashRegister) => {
			this.createCashRegister({
				state: 'normal',
				position: new mp.Vector3(cashRegister.position.x, cashRegister.position.y, cashRegister.position.z),
				rotation: cashRegister.heading,
			});
		});

		setInterval(() => {
			Array.from(this.cashRegisters.entries()).forEach(([id, cashRegister]) => {
				if (cashRegister.state === 'emptied') {
					if (Date.now() - cashRegister.robbedAt > robInterval) {
						this.resetCashRegister(id);
					}
				}
			});
		}, robInterval / 60);
	}
}

export default new MarketRobbery();
