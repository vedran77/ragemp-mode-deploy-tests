import tasks from 'awards/tasks';
import Job from '../job';
import Mover from './mover';
import Welder from './welder';
import Driver from './driver';

class Building extends Job {
  constructor() {
    super(
      'Building',
      [85, 385, 480],
      { x: -471.275, y: -867.756, z: 23.964 },
      { name: 'Građevina', model: 566, color: 47 }
    );
  }

  async addSkillPoints(player: Player) {
    await super.addSkillPoints(player);
    await tasks.implement(player, 'building_money');
  }

  protected getBranchOfLevel(level: number) {
    switch (level) {
      case 0:
        return Mover;
      case 1:
        return Welder;
      case 2:
      default:
        return Driver;
    }
  }
}

const job = new Building();

job.addBranch(Mover);
job.addBranch(Welder);
job.addBranch(Driver);
