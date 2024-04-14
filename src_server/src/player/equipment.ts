import weapons from 'basic/weapons';
import inventoryHelper from 'basic/inventory/helper';
import clothes from './clothes';
import armor from './armor';

const slots = {
  armor: 'armor',
  weapon: 'hands',
};

class PlayerEquipment {
  isEquipped(player: Player, item: InventoryItem) {
    const slot = item.data?.slot;
    return !!player.equipment[slot];
  }

  isQuickSlot(slot: string) {
    return slot && slot.split('_')[0] === 'quick';
  }

  getEquipment(player: Player, type: string, name?: string) {
    const item = player.equipment[type];
    return name && item?.name !== name ? null : item;
  }

  init(player: Player) {
    if (player.equipment) return;

    player.equipment = {};
    clothes.clear(player);
    player.inventory.forEach((item) => {
      const slot = item.data?.slot;

      if (this.isQuickSlot(slot)) this.setToSlot(player, slot, item);
      else if (slot || item.name === 'bag') this.equip(player, item);
    });
  }

  async equip(player: Player, item: InventoryItem) {
    const data = inventoryHelper.getItemData(item?.name);

    if (!data) return;

    if (item.name === 'bag') {
      this.setItem(player, 'bag', item);
      return;
    }

    const slot = this.getSlotForItem(item);
    if (!slot || player.equipment[slot]) return;

    await this.setItem(player, data.type, item);
    this.setToSlot(player, slot, item);

    return slot;
  }

  async unequip(player: Player, item: InventoryItem) {
    const data = inventoryHelper.getItemData(item?.name);

    if (!data) return;

    if (item.name === 'bag') {
      clothes.hide(player, item.name as any);
      return;
    } else if (data.type === 'ammo') {
      const weapon = this.getEquipment(player, 'hands');

      if (!weapon) return;

      const ammoType = inventoryHelper.getItemData(weapon.name)?.ammo;
      const invAmmo = player.inventory
        .filter(
          (invItem) => invItem.name === ammoType && invItem.cell !== item.cell
        )
        .reduce((prev, curr) => {
          return {
            ...curr,
            amount: (prev?.amount || 0) + curr.amount,
          };
        }, null);

      if (invAmmo) {
        weapons.giveAmmo(player, invAmmo);
      } else {
        weapons.removeAmmo(player);
      }
    }

    if (!data || !this.isEquipped(player, item)) return;

    const { slot } = item.data;

    if (!this.isQuickSlot(slot)) {
      switch (data.type) {
        case 'weapon':
          weapons.removeWeapon(player);
          break;
        case 'clothes':
          clothes.hide(player, item.name as any);
          break;
        case 'armor':
          armor.remove(player);
          break;

        default:
          break;
      }
    }

    delete item.data.slot;
    this.setToSlot(player, slot);
  }

  setToSlot(player: Player, slot: string, item?: InventoryItem) {
    if (item) {
      item.cell = -1;
      item.data = { ...item.data, slot };
      player.equipment[slot] = item;
    } else {
      delete player.equipment[slot];
    }

    if (slot === 'hands') player.mp.setOwnVariable('inHand', item?.name);
    else if (this.isQuickSlot(slot)) {
      player.mp.setOwnVariable(slot, !!item);
    }
  }

  private getSlotForItem(item: InventoryItem) {
    const data = inventoryHelper.getItemData(item.name);
    const slot: string = slots[data?.type] ?? data?.equipment;

    return slot;
  }

  private async setItem(player: Player, type: string, item: InventoryItem) {
    switch (type) {
      case 'clothes':
        clothes.set(player, item.name as any, item.data as any);
        break;
      case 'armor':
        armor.set(player, item);
        break;
      case 'weapon':
        weapons.giveWeapon(player, item.name);
        break;
      case 'bag':
        clothes.set(player, 'bag', {
          style: 81,
          color: 0,
        });
        break;
      default:
        break;
    }
  }
}

export default new PlayerEquipment();
