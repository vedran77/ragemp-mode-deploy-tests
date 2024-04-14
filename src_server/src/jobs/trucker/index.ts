import tasks from 'awards/tasks';
import Job from '../job';
import Starter from './starter';

class Trucking extends Job {
  constructor() {
    super(
      'Trucking',
      [85],
      { x: 1196.673, y: -3254.86, z: 7.095 },
      { name: 'Kamiondzija', model: 67, color: 81 }
    );
  }

  async addSkillPoints(player: Player) {
    await super.addSkillPoints(player);
    await tasks.implement(player, 'trucking_money');
  }

  protected getBranchOfLevel(level: number) {
    switch (level) {
      default:
        return Starter;
    }
  }
}

const job = new Trucking();

job.addBranch(Starter);
