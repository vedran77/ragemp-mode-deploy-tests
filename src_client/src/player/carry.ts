class CarryPlayer {
  remoteId: number = -1;
  carryRemoteId: number = -1;
  ped: PedMp;

  constructor(remoteId: number, carryRemoteId: number) {
    this.remoteId = remoteId;
    this.carryRemoteId = carryRemoteId;
  }
}

class CarryManager {
  carryPlayers: CarryPlayer[] = [];

  constructor() {
    mp.events.addDataHandler('carry', (entity: EntityMp, value: any) => {
      if (entity.type != 'player') return false;

      mp.players.forEachInStreamRange((element) => {
        if (element != entity) return false;

        if (value != undefined) {
          var carry = this.getCarry(value);

          if (!carry) this.addCarry(entity.remoteId, value);
        } else {
          var carry = this.getCarry(entity.remoteId);

          if (carry) this.removeCarry(entity.remoteId);
        }
      });
    });

    mp.events.add('entityStreamIn', (entity: EntityMp) => {
      if (entity.type != 'player') return false;

      var value = entity.getVariable('carry');

      if (value != undefined) {
        var carry = this.getCarry(value);

        if (!carry) this.addCarry(entity.remoteId, value);
      }
    });

    mp.events.add('entityStreamOut', (entity: EntityMp) => {
      if (entity.type != 'player') return false;

      var value = entity.getVariable('carry');

      if (value != undefined) {
        var carry = this.getCarry(entity.remoteId);

        if (carry) this.removeCarry(entity.remoteId);
      }
    });

    setInterval(() => {
      this.carryPlayers.forEach((element) => {
        mp.players.forEachInStreamRange((target) => {
          if (target.remoteId == element.carryRemoteId) {
            if (mp.peds.exists(element.ped)) return false;

            var player = mp.players.atRemoteId(element.remoteId);
            var carried = mp.players.atRemoteId(element.carryRemoteId);

            mp.events.call(
              'client:animation:apply',
              player.remoteId,
              'missfinale_c2mcs_1',
              'fin_c2_mcs_1_camman',
              49
            );
            mp.events.call(
              'client:animation:apply',
              carried.remoteId,
              'nm',
              'firemans_carry',
              33
            );
            carried.attachTo(
              player.handle,
              0,
              0.15,
              0.27,
              0.63,
              0.5,
              0.5,
              0.0,
              false,
              false,
              false,
              false,
              2,
              false
            );

            element.ped = mp.peds.new(carried.model, player.position, 0);
            mp.game.invoke(
              '0xe952d6431689ad9a',
              carried.handle,
              element.ped.handle
            );
            element.ped.taskPlayAnim(
              'nm',
              'firemans_carry',
              8.0,
              1.0,
              -1,
              33,
              0.0,
              true,
              true,
              true
            );
            element.ped.attachTo(
              player.handle,
              0,
              0.25,
              0.07,
              0.63,
              0.5,
              0.5,
              0.0,
              false,
              false,
              false,
              false,
              2,
              false
            );
          }
        });
      });
    }, 500);
  }

  addCarry(remoteId: number, carryRemoteId: number) {
    this.carryPlayers.push(new CarryPlayer(remoteId, carryRemoteId));
  }

  getCarry(remoteId: number): CarryPlayer | undefined {
    var found = this.carryPlayers.find(
      (element) => element.remoteId == remoteId
    );

    if (found) return found;
    else return undefined;
  }

  removeCarry(remoteId: number) {
    var found = this.carryPlayers.find(
      (element) => element.remoteId == remoteId
    );

    if (found) {
      if (mp.peds.exists(found.ped)) found.ped.destroy();

      var carry = mp.players.atRemoteId(found.carryRemoteId);

      if (carry) carry.detach(true, false);
    }

    var findIndex = this.carryPlayers.findIndex(
      (element) => element.remoteId == remoteId
    );

    if (findIndex != -1) this.carryPlayers.splice(findIndex, 1);
  }
}

var Carry = new CarryManager();
