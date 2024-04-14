import Job from '../job';
import Courier from './courier';

class Smuggling extends Job {
  constructor() {
    super('Smuggling', [130, 130, 130], {
      x: 1443.863,
      y: 1132.018,
      z: 114.334,
    });
    this.cooldown.setTimeLimit(20 * 60 * 1000);
  }

  async startWork(player: Player, level: number) {
    if (player.level < 3) {
      return mp.events.reject('Potreban ti je 3 nivo igre');
    }
    if (player.faction !== 'armenian') {
      return mp.events.reject('Niste clan odgovarajuce fakcije');
    }

    await super.startWork(player, level);
  }

  protected getBranchOfLevel() {
    return Courier;
  }
}

const job = new Smuggling();

job.addBranch(Courier);
