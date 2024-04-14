import MaterialsLoading from '../materials/loading';
import Warehouse from './warehouse';
import attachments from 'helpers/attachments';
import animations from 'helpers/animations';

class WarehouseLoading extends MaterialsLoading {
  private warehouse: Warehouse;

  constructor(position: PositionEx, warehouse: Warehouse) {
    super(position, 3);

    this.warehouse = warehouse;
  }

  private playerHasBox(player: PlayerMp) {
    return attachments.has(player, 'card_box');
  }

  protected async checkCanBeLoaded(player: Player) {
    let err: string;

    if (player.isDriver()) return;
    else if (!this.playerHasBox(player.mp))
      err = 'Morate imati kutiju u rukama';
    else if (!this.warehouse.faction.inFaction(player)) {
      err = 'Ne možete koristiti ovaj utovar';
    }

    return err && mp.events.reject(err);
  }

  protected async loadIteration(player: Player) {
    if (player.mp.vehicle) return;

    try {
      attachments.remove(player.mp, 'card_box');
      animations.stopOnServer(player.mp);

      await this.warehouse.changeMaterials(+250);
    } catch (err) {
      return err && mp.events.reject(err.message);
    }
  }
}

export default WarehouseLoading;
