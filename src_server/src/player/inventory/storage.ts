import { last } from 'lodash';
import CharModel from 'models/Character';
import Inventory, { StorageData } from 'basic/inventory';

class PlayerInventoryStorage extends Inventory {
  constructor() {
    super('player');

    mp.events.subscribe({
      'Inventory-ShowPlayerMenu': this.showMenu.bind(this),
      'Inventory-SelfMove': this.moveItem.bind(this),
      'Inventory-SelfSeparate': this.separateItem.bind(this),
      'Inventory-PlayerTransfer': this.transferItem.bind(this),
    });
  }

  getMaxCells(player: Player) {
    return 30;
  }

  showMenu(player: Player, storage?: StorageData) {
    const data: any[] = [player.inventory, this.getMaxCells(player)];

    if (storage) {
      const { type, ...props } = storage;

      data.push({
        ...props,
        name: type,
      });
    } else {
      data.push(player.equipment);
    }

    player.callEvent('Inventory-ShowMenu', data);
  }

  setCapacity(player: Player, cells: number) {
    player.callEvent('Inventory-SetCapacity', [cells]);
  }

  async updateInDb(id: string, data: InventoryItem[]) {
    await CharModel.findByIdAndUpdate(id, { $set: { inventory: data } });
  }

  private async moveItem(player: Player, cell: number, targetCell: number) {
    await this.move(player.inventory, cell, targetCell);
    await this.updateInDb(player.dbId, player.inventory);

    return player.inventory;
  }

  private async separateItem(player: Player, cell: number, amount: number) {
    await this.separate(player, player.inventory, cell, amount);
    await this.updateInDb(player.dbId, player.inventory);

    return last(player.inventory);
  }

  private async transferItem(
    player: Player,
    inside: boolean,
    cell: number,
    targetCell: number
  ) {
    const target = mp.players.get(player.target as PlayerMp);

    await this.transfer(
      player,
      player.inventory,
      target.inventory,
      inside,
      cell,
      targetCell
    );
    await this.updateInDb(target.dbId, target.inventory);
    await this.updateInDb(player.dbId, player.inventory);

    return {
      item: this.getItemOfCell(
        inside ? target.inventory : player.inventory,
        targetCell
      ),
    };
  }
}

export default new PlayerInventoryStorage();
