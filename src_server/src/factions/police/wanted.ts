import CharModel from 'models/Character';
import WantedModel from 'models/Wanted';
import prison from 'basic/prison';
import factions from 'factions';
import cuffs from 'factions/actions/cuffs';

class WantedList {
  constructor() {
    mp.events.subscribe({
      'WantedList-GetItems': this.getItems,
      'WantedList-FindById': this.findBySuspectId.bind(this),
      'WantedList-AddItem': this.addItem.bind(this),
      'WantedList-RemoveItem': this.removeItem.bind(this),
      'WantedList-Arrest': this.arrest,
    });
  }

  async addItem(
    player: Player,
    userId: string,
    reason: string,
    priority: number
  ) {
    if (!player.faction || !reason?.length) throw new SilentError('wanted err');

    const isExists = await WantedModel.findOne({
      suspect: userId,
    }).countDocuments();

    if (isExists) return mp.events.reject('Ovaj igrač je već tražen');

    const target = mp.players.getByDbId(userId);
    target.callEvent('Player-SetWantedLevel', priority);

    await WantedModel.create({
      creator: player.dbId,
      suspect: userId,
      priority,
      reason,
    });
  }

  private async removeItem(player: Player, wantedId: string) {
    const faction = factions.getFaction(player.faction);

    if (!faction.hasAccess(player, 'wanted')) {
      throw new SilentError('access denied');
    }

    const wanted = await WantedModel.findByIdAndRemove(wantedId);

    mp.players.getByDbId(wanted.suspect).callEvent('Player-SetWantedLevel', 0);
  }

  private async findBySuspectId(player: Player, id: string) {
    const data = await WantedModel.findOne({ suspect: id })
      .populate({
        path: 'suspect',
        select: 'firstName lastName',
      })
      .select({ creator: 0 })
      .lean();

    if (data) {
      const { suspect } = data as typeof data & { suspect: CharModel };

      return {
        ...data,
        id: data._id,
        suspect: `${suspect.firstName} ${suspect.lastName}`,
      };
    }
  }

  private async getItems(player: Player, amount: number) {
    if (!player.faction) throw new SilentError('access error');

    const players = mp.players
      .toCustomArray()
      .slice(amount, amount + 10)
      .map((item) => item.dbId);

    const data = await WantedModel.find({ suspect: { $in: players } })
      .sort({ _id: -1 })
      .populate({
        path: 'suspect',
        select: 'firstName lastName',
      })
      .select({ creator: 0 })
      .lean();

    return data.map((item) => {
      const { suspect } = item as typeof item & { suspect: CharModel };

      return {
        ...item,
        id: item._id,
        suspect: suspect
          ? `${suspect.firstName} ${suspect.lastName}`
          : 'Deleted',
      };
    });
  }

  private async arrest(
    player: Player,
    userId: string,
    time: number,
    reason: string
  ) {
    const faction = factions.getFaction(player.faction);
    if (!faction.hasAccess(player, 'wanted')) {
      return mp.events.reject('Greška pristupa');
    }

    const target = mp.players.getByDbId(userId);

    if (!prison.inZone(player) || !player.entityIsNearby(target?.mp)) {
      return mp.events.reject('Morate biti u zatvoru');
    }
    if (!cuffs.inCuffs(target)) {
      return mp.events.reject('Građanin mora biti vezan lisicama');
    }

    await prison.imprisonPlayer(target, time, reason);
    await WantedModel.deleteOne({ suspect: userId });

    target.callEvent('Player-SetWantedLevel', 0);

    cuffs.reset(target);
  }
}

export const wantedList = new WantedList();
