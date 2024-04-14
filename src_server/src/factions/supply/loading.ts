import materials from '../materials/vehicle';
import MaterialsLoading from '../materials/loading';
import { Strategy } from './index';

class SupplyLoading extends MaterialsLoading {
  private supply: Strategy;

  constructor(position: PositionEx, supply: Strategy) {
    super(position);

    this.supply = supply;
  }

  protected async checkCanBeLoaded(player: Player) {
    let err: string;

    // if (!player.isDriver()) err = 'Morate biti vozač';
    // else
    if (this.supply.materialsLeft <= 0) err = 'Nema više materijala';

    return err && mp.events.reject(err);
  }

  protected async loadIteration(player: Player) {
    try {
      await materials.getCargo(player);
      this.supply.changeMaterials(-250);
    } catch (err) {
      return err && mp.events.reject(err.message);
    }
  }
}

export default SupplyLoading;
