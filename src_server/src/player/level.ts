import hud from 'helpers/hud';
import referral from 'awards/referral';

class Level {
  private multiplier = 200;

  private maxLevel = 20;

  addExp(player: Player, amount: number) {
    if (this.getLevelFromExp(player.experience) < this.maxLevel) {
      player.experience += amount;
    }

    const level = this.getLevelFromExp(player.experience);
    const exp = this.getNeededExp(level);

    if (level === referral.confirmLevel) referral.confirm(player);

    player.mp.setVariable('level', level);
    player.mp.setVariable('experiences', [player.experience, exp]);

    hud.showLevel(player, level, [player.experience, exp]);
  }

  getLevelFromExp(exp: number) {
    let level = 0;

    while (exp >= this.getNeededExp(level)) level++;

    return level;
  }

  getNeededExp(level: number) {
    // eslint-disable-next-line no-restricted-properties
    return this.multiplier * (Math.pow(2, level) - 1);
  }
}

export default new Level();
