import { last } from 'lodash';
import HouseModel from 'models/House';
import Inventory from 'basic/inventory';
import playerInventory from 'player/inventory/storage';
import houses from './entities';
import hud from 'helpers/hud';

class HouseInventory extends Inventory {
  constructor() {
    super('house');

    mp.events.subscribe({
      'Inventory-HouseMove': this.moveItem.bind(this),
      'Inventory-HouseSeparate': this.separateItem.bind(this),
      'Inventory-HouseTransfer': this.transferItem.bind(this),
    });
  }

  getMaxCells(player: Player) {
    const house = houses.getItem(player);
    return houses.getInventoryCapacity(house).cells;
  }

  showMenu = (player: Player) => {
    const house = houses.getItem(player);
    if (!house?.owner) return;

    playerInventory.showMenu(player, {
      type: this.name,
      cells: this.getMaxCells(player),
      items: house.inventory,
    });
  };

  async moveItem(player: Player, cell: number, targetCell: number) {
    const house = houses.getItem(player);

    if (!house.inventory) {
      hud.showNotification(
        player,
        'error',
        'Nemate pristup ili niste na checkpointu'
      );
      return;
    }

    await this.move(house.inventory, cell, targetCell);
    await this.updateInDb(house.id, house.inventory);

    return house.inventory;
  }

  async separateItem(player: Player, cell: number, amount: number) {
    const house = houses.getItem(player);

    if (!house.inventory) {
      hud.showNotification(
        player,
        'error',
        'Nemate pristup ili niste na checkpointu'
      );
      return;
    }

    await this.separate(player, house.inventory, cell, amount);
    await this.updateInDb(house.id, house.inventory);

    return last(house.inventory);
  }

  async transferItem(
    player: Player,
    inside: boolean,
    cell: number,
    targetCell: number
  ) {
    const house = houses.getItem(player);

    if (!house.inventory) {
      hud.showNotification(
        player,
        'error',
        'Nemate pristup ili niste na checkpointu'
      );
      return;
    }

    await this.transfer(
      player,
      player.inventory,
      house.inventory,
      inside,
      cell,
      targetCell
    );
    await this.updateInDb(house.id, house.inventory);
    await playerInventory.updateInDb(player.dbId, player.inventory);

    return {
      item: this.getItemOfCell(
        inside ? house.inventory : player.inventory,
        targetCell
      ),
    };
  }

  async updateInDb(id: string, data: InventoryItem[]) {
    await HouseModel.findByIdAndUpdate(id, { $set: { inventory: data } });
  }
}

export default new HouseInventory();
