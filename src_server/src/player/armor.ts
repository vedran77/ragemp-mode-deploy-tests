import inventory from 'basic/inventory/helper';
import clothes from './clothes';
import equipment from './equipment';

class PlayerArmor {
  set(player: Player, item: InventoryItem) {
    const health = this.getHealth(item);

    if (health <= 0) item.amount = 0;
    else {
      player.mp.armour = health;

      if (['lspd', 'lssd'].includes(player.faction)) {
        player.gender;
        if (item.name === 'armor_heavy') {
          if (player.gender === 'male') {
            clothes.set(player, 'armor', {
              style: player.faction === 'lspd' ? 16 : 27,
              color: player.faction === 'lspd' ? 0 : 3,
            });
          } else {
            clothes.set(player, 'armor', {
              style: player.faction === 'lspd' ? 18 : 27,
              color: 0,
            });
          }

          return;
        } else {
          clothes.set(player, 'armor', {
            style: player.faction === 'lspd' ? 0 : 4,
            color: player.faction === 'lspd' ? 0 : 2,
          });

          return;
        }
      } else {
        clothes.set(player, 'armor', {
          style: 1,
          color: inventory.getItemData(item.name)?.texture ?? 0,
        });
      }
    }
  }

  remove(player: Player) {
    player.mp.armour = 0;
    clothes.hide(player, 'armor');
  }

  applyDamage(player: Player, damage: number) {
    const armor = equipment.getEquipment(player, 'armor');
    if (!armor) return;

    armor.data.health -= damage;

    if (armor.data.health <= 0) {
      equipment.unequip(player, armor);
      inventory.removeItem(player.inventory, armor);
    }
  }

  private getHealth(item: InventoryItem) {
    return item.data?.health;
  }
}

export default new PlayerArmor();
