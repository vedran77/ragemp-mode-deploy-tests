import { remove } from 'lodash';
import items from 'data/inventory.json';

type ItemData = {
  type: string;
  name: string;
  stack: number;
  model: string;
  equipment?: string;
  onlyOne?: boolean;
} & { [key: string]: any };

class InventoryHelper {
  getItemData(name: string) {
    return items?.[name] as ItemData;
  }

  findItem(storage: InventoryItem[], name: string) {
    return storage.find((item) => item.name === name);
  }

  removeItem(storage: InventoryItem[], item: InventoryItem) {
    remove(
      storage,
      (data) => data.cell === item.cell && data.name === item.name
    );
  }

  changeItemAmount(
    storage: InventoryItem[],
    item: InventoryItem,
    amount: number
  ) {
    if (item.amount + amount < 0) throw new SilentError('not enough');

    item.amount += amount;
    if (item.amount <= 0) this.removeItem(storage, item);
  }
}

export default new InventoryHelper();
