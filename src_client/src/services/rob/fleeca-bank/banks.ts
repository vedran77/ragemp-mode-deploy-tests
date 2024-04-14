import Natives from 'data/natives.json';
import { banks } from './data';

const localPlayer = mp.players.local;

type Bank = {
	safe: {
		position: PositionEx;
		status: boolean;
	};
	cells: [
		{
			position: PositionEx;
			status: boolean;
		}
	];
	loots: boolean[];
	bankStatus: 'closed' | 'opened' | 'robbed';
};

class FleecaBanks {
	private banks: Bank[] = [];
	private loots: ObjectMp[] = [];

	constructor() {
		mp.events.subscribe({
			'FleecaBank-UpdateSafeStatus': this.updateSafeStatus.bind(this),
		});

		this.load();
	}

	get bankData() {
		return this.banks;
	}

	get trollies() {
		return this.loots;
	}

	loadLoots(index: number) {
		if (this.trollies.length > 0) return;

		banks[index].loots.forEach(async (loot) => {
			const lootNearBy = mp.game.object.getClosestObjectOfType(
				loot.x,
				loot.y,
				loot.z,
				1.5,
				mp.game.joaat('hei_prop_hei_cash_trolly_01'),
				false,
				false,
				false
			);

			if (lootNearBy) return;

			const trolly = await mp.objects.create(
				mp.game.joaat('hei_prop_hei_cash_trolly_01'),
				new mp.Vector3(loot.x, loot.y, loot.z),
				{
					rotation: new mp.Vector3(0, 0, loot.rot),
				}
			);

			trolly.setCollision(true, true);

			this.loots.push(trolly);
		});
	}

	setSafeDoorToggle(index: number, initial?: boolean) {
		const bank = banks[index];

		const safeDoorNearBy = mp.game.object.getClosestObjectOfType(
			bank.safe.x,
			bank.safe.y,
			bank.safe.z,
			20,
			bank.type === 'fleeca' ? mp.game.joaat('v_ilev_gb_vauldr') : mp.game.joaat('v_ilev_bk_vaultdoor'),
			false,
			false,
			false
		);

		mp.game.invoke(Natives.FREEZE_ENTITY_POSITION, safeDoorNearBy, true);

		if (mp.game.invoke(Natives.GET_ENTITY_HEADING, safeDoorNearBy) !== bank.safe.toRot) {
			mp.game.invoke(
				Natives.SET_ENTITY_HEADING,
				safeDoorNearBy,
				this.banks[index].safe.status ? bank.safe.toRot : bank.safe.rot
			);

			if (!initial) this.loadLoots(index);
		}
	}

	setCellDoorToggle(bankIndex: number, cellIndex: number, status: boolean) {
		const bank = banks[bankIndex];
		const cellData = bank.cells[cellIndex];

		mp.game.object.doorControl(
			mp.game.joaat(cellData.model),
			cellData.x,
			cellData.y,
			cellData.z,
			!status,
			0.0,
			0.0,
			0
		);
	}

	updateSafeStatus(bankIndex: number, status: boolean) {
		const bank = banks[bankIndex];

		if (!bank) {
			return;
		}

		this.banks[bankIndex].safe.status = status;

		this.setSafeDoorToggle(bankIndex);

		// this.loadLoots(bankIndex);

		bank.cells.forEach((_, index) => {
			this.setCellDoorToggle(bankIndex, index, this.banks[bankIndex].cells[index].status);
		});
	}

	async updateCellStatus(bankIndex: number, cellIndex: number, status: boolean) {
		const bank = banks[bankIndex];

		if (!bank) {
			return;
		}

		this.banks[bankIndex].cells[cellIndex].status = status;

		this.setCellDoorToggle(bankIndex, cellIndex, status);

		await mp.events.callServer('FleecaBank-BombDone', [bankIndex, cellIndex]);
	}

	checkDoors(index: number) {
		const bank = banks[index];

		const safeDoorNearBy = mp.game.object.getClosestObjectOfType(
			bank.safe.x,
			bank.safe.y,
			bank.safe.z,
			20,
			bank.type === 'fleeca' ? mp.game.joaat('v_ilev_gb_vauldr') : mp.game.joaat('v_ilev_bk_vaultdoor'),
			false,
			false,
			false
		);

		if (
			mp.game.invoke(Natives.GET_ENTITY_HEADING, safeDoorNearBy) !== bank.safe.toRot &&
			!this.banks[index].safe.status
		)
			return;

		mp.game.invoke(Natives.SET_ENTITY_HEADING, safeDoorNearBy, bank.safe.toRot);

		// this.loadLoots(index);
	}

	getLootNearBy(): [number, ObjectMp] {
		if (this.trollies.length <= 0) return [null, null];

		const trolley = this.trollies?.find(
			(loot) =>
				mp.game.gameplay.getDistanceBetweenCoords(
					localPlayer.position.x,
					localPlayer.position.y,
					localPlayer.position.z,
					loot.position.x,
					loot.position.y,
					loot.position.z,
					true
				) < 1
		);

		if (!trolley) return [null, null];

		const lootObjectId = mp.game.object.getClosestObjectOfType(
			trolley.position.x,
			trolley.position.y,
			trolley.position.z,
			1.5,
			mp.game.joaat('hei_prop_hei_cash_trolly_01'),
			false,
			false,
			false
		);

		return [lootObjectId, trolley];
	}

	private async load() {
		const sBanks: Bank[] = await mp.events.callServer('FleecaBank-GetAll');

		this.banks = sBanks;

		sBanks.forEach((bank, index) => {
			banks[index].cells.forEach((cell, cellIndex) => {
				mp.game.object.doorControl(
					mp.game.joaat(cell.model),
					cell.x,
					cell.y,
					cell.z,
					bank.cells[cellIndex].status,
					0.0,
					0.0,
					0
				);
			});
		});
	}
}

export default new FleecaBanks();
