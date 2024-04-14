import factions from 'factions';
import materials from '../materials/vehicle';
import MaterialsLoading from '../materials/loading';
import fortWar from './fort';

class WarsLoading extends MaterialsLoading {
  private war: typeof fortWar;

  constructor(position: PositionEx, war: typeof fortWar) {
    super(position);

    this.war = war;
  }

  protected async checkCanBeLoaded(player: Player) {
    let err: string;

    // if (!player.isDriver()) err = 'Morate biti vozač';
    // else

    if (!player.faction || factions.getFaction(player.faction).government) {
      err = 'Ne možete uzimati materijale na ovom mestu';
    } else if (!this.war.isStarted) err = 'Nema više materijala';

    return err && mp.events.reject(err);
  }

  protected async loadIteration(player: Player) {
    try {
      await materials.getCargo(player);
      this.war.changeMaterials(-250);
    } catch (err) {
      return err && mp.events.reject(err.message);
    }
  }
}

export default WarsLoading;
