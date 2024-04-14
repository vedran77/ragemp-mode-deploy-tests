import UserModel from 'models/User';

export type PermissionLevel =
  | 'helper'
  | 'advisor'
  | 'jadmin'
  | 'admin'
  | 'hadmin'
  | 'manager'
  | 'owner'
  | 'developer';

export const AdminLevels = {
  helper: {
    name: 'Helper',
    level: 1,
  },
  advisor: {
    name: 'Advisor',
    level: 2,
  },
  jadmin: {
    name: 'Junior Admin',
    level: 3,
  },
  admin: {
    name: 'General Admin',
    level: 4,
  },
  sadmin: {
    name: 'Senior Admin',
    level: 5,
  },
  hadmin: {
    name: 'Head Admin',
    level: 6,
  },
  manager: {
    name: 'Menadžer',
    level: 7,
  },
  owner: {
    name: 'Vlasnik',
    level: 8,
  },
  developer: {
    name: 'Developer',
    level: 9,
  },
};

class Permissions {
  private list: { [name in PermissionLevel]: number };

  constructor() {
    this.list = Object.keys(AdminLevels).reduce(
      (acc, key) => {
        const level = AdminLevels[key];
        acc[key] = level.level;

        return acc;
      },
      {} as { [key in PermissionLevel]: number } // Provide an initial value for the accumulator
    );
  }

  hasPermission(player: Player, level: PermissionLevel) {
    return player.adminLvl >= this.list[level];
  }

  async giveAccess(player: Player, level: PermissionLevel) {
    await this.setPermission(player, level);
  }

  async withdrawAccess(player: Player) {
    await this.setPermission(player);
  }

  private async setPermission(player: Player, level?: PermissionLevel) {
    const index = this.list[level] || 0;

    await UserModel.findByIdAndUpdate(player.account, {
      $set: { adminLvl: index },
    });

    player.adminLvl = index;
  }
}

export default new Permissions();
