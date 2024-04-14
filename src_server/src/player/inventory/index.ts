import { isNumber } from 'lodash';
import hud from 'helpers/hud';
import InventoryStorage from 'basic/inventory';
import inventoryHelper from 'basic/inventory/helper';
import vehicleLock from 'vehicle/lock';
import equipment from '../equipment';
import hunger from '../hunger';
import alcohol from '../alcohol';
import drugs from '../drugs';
import health from '../health';
import playerStorage from './storage';
import chat, { COMMANDS } from 'basic/chat';

class PlayerInventory {
	private storage: InventoryStorage;
	private animInterval: NodeJS.Timeout | null = null;

	constructor(storage: InventoryStorage) {
		this.storage = storage;

		mp.events.subscribe({
			'Inventory-Drop': this.dropItem.bind(this),
			'Inventory-UnequipItem': this.unequipItem.bind(this),
			'Inventory-Use': this.useItem.bind(this),
			'Inventory-UseQuick': this.useQuickItem.bind(this),
			'Inventory-ToQuick': this.setToQuick.bind(this),
		});
	}

	checkEnoughSlots(player: Player, items: Omit<InventoryItem, 'cell'>[]) {
		const cell = this.storage.getFreeCell(player, player.inventory);

		if (!isNumber(cell)) {
			hud.showNotification(player, 'error', 'Nema dovoljno mesta u inventaru', true);
			throw new SilentError('not enough slots');
		}
	}

	async clear(player: Player) {
		const items: InventoryItem[] = [];

		Object.entries(player.equipment).forEach(([slot, item]) => {
			if (slot === 'hands' || slot === 'ammo' || equipment.isQuickSlot(slot)) {
				equipment.unequip(player, item);
				items.push(item);
			}
		});
		player.inventory = player.inventory.filter((item) => {
			return items.findIndex(({ name, cell }) => item.cell === cell && item.name === name) < 0;
		});

		await this.storage.updateInDb(player.dbId, player.inventory);
	}

	async addItem(player: Player, item: Omit<InventoryItem, 'cell'>) {
		const invItem = await this.storage.add(player, player.inventory, item);
		await this.storage.updateInDb(player.dbId, player.inventory);

		const data = inventoryHelper.getItemData(invItem.name);

		// Equip item when added to inventory
		switch (data.type) {
			case 'ammo':
				await equipment.equip(player, invItem);
				break;

			case 'bag':
				await equipment.equip(player, invItem);
				break;
		}
	}

	private async useItem(player: Player, cell: number, target?: InventoryItem) {
		const items = player.inventory;

		const item = target ?? this.storage.getItemOfCell(items, cell);
		const data = inventoryHelper.getItemData(item?.name);

		if (!item || item.amount <= 0 || !data || player.mp.getOwnVariable('isPlayingAnim')) {
			throw new SilentError('wrong item');
		}

		const slot = await equipment.equip(player, item);

		if (!slot) {
			switch (data.type) {
				case 'food':
					hunger.eat(player, item);
					break;
				case 'alcohol':
					alcohol.drink(player, item);
					break;
				case 'drugs':
					drugs.use(player, item);
					break;
				case 'medicine':
					await health.selfHeal(player, item);
					break;
				default:
					if (item.name === 'lockpick') await vehicleLock.pick(player, item);
					break;
			}
		}

		return {
			item: item.amount > 0 ? item : inventoryHelper.removeItem(items, item),
			equipment: slot,
		};
	}

	private async useQuickItem(player: Player, slot: string) {
		const item = equipment.getEquipment(player, slot);

		const hasItemInHands = !!equipment.getEquipment(player, 'hands');
		if (!item || hasItemInHands) return;

		const data = await this.useItem(player, -1, item);

		const itemName = inventoryHelper.getItemData(item.name).name;
		chat.sendPlayerMessage(player, `uzima oružije(${itemName.toUpperCase()}) iz unutrašnjosti`, COMMANDS.ME);

		if (data.equipment || !data.item) {
			equipment.setToSlot(player, slot);
		}
	}

	private async setToQuick(player: Player, cell: number, slot: string) {
		if (slot === 'hands') {
			const itemCell = await this.unequipItem(player, slot);

			const item = this.storage.getItemOfCell(player.inventory, itemCell);
			equipment.setToSlot(player, `quick_${cell}`, item);

			const itemName = inventoryHelper.getItemData(item.name).name;
			chat.sendPlayerMessage(player, `vraća oružije(${itemName.toUpperCase()}) u unutrašnjost`, COMMANDS.ME);

			return item;
		}

		const item = this.storage.getItemOfCell(player.inventory, cell);
		if (!item) throw new SilentError("item doesn't exists");

		const itemType = inventoryHelper.getItemData(item?.name)?.type;
		if (itemType !== 'weapon') throw new SilentError('wrong item');

		equipment.setToSlot(player, slot, item);

		return item;
	}

	private async dropItem(player: Player, cell: number | string) {
		const item = isNumber(cell)
			? this.storage.getItemOfCell(player.inventory, cell)
			: equipment.getEquipment(player, cell);

		if (!item || item.amount <= 0 || player.mp.vehicle) {
			throw new SilentError('item does not exists');
		}

		await equipment.unequip(player, item);
		inventoryHelper.removeItem(player.inventory, item);
		await this.storage.updateInDb(player.dbId, player.inventory);

		mp.pickups.create(player.mp.position, player.mp.dimension, item);
	}

	private async unequipItem(player: Player, slot: string, cell?: number) {
		const item = equipment.getEquipment(player, slot);
		if (!item) throw new SilentError("this slot doesn't equip");

		const targetCell =
			isNumber(cell) && !this.storage.getItemOfCell(player.inventory, cell)
				? cell
				: this.storage.getFreeCell(player, player.inventory);

		if (slot !== 'hands' && !targetCell) throw new SilentError('not enough slots');

		await equipment.unequip(player, item);
		item.cell = targetCell;

		return targetCell;
	}
}

export default new PlayerInventory(playerStorage);
