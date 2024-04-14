import moment from 'moment';
import CharModel from 'models/Character';
import offers from 'helpers/offers';
import { finishWork } from 'jobs';
import emsCalls from 'factions/lsfd/calls';

class PlayerEvents {
  constructor() {
    mp.events.add('playerJoin', this.onJoin);
    mp.events.add('playerQuit', this.onLeave);
    mp.events.add('Player-PointUpdate', (player, camPitch, camHeading) => {
      mp.players.call(player.streamedPlayers, 'Player-PointUpdate', [
        player.id,
        camPitch,
        camHeading,
      ]);
    });

    mp.events.subscribe({
      playerSelectTarget: (player: Player, target: any) => {
        player.target = target;
      },
      playerCreateWaypoint: (player: Player, coords: PositionEx) => {
        if (!coords) return;

        if (player.mp.vehicle) {
          player.mp.vehicle.getOccupants().forEach((p: PlayerMp) => {
            const playerData = mp.players.get(p);

            playerData.waypoint = new mp.Vector3(coords.x, coords.y, coords.z);
          });
          return;
        }

        player.waypoint = new mp.Vector3(coords.x, coords.y, coords.z);
      },
      'Player-KickAfk': (player: Player) => {
        // player.mp.kick('AFK');
      },
    });
  }

  private onJoin(player: PlayerMp) {
    player.colshapes = [];
    player.attachments = [];

    player.spawn(new mp.Vector3(-405.8, 1237.83, 325.63));
    player.dimension = player.id + 1000;
    player.heading = 125.81;
  }

  private async onLeave(player: PlayerMp) {
    const { id, position, health } = player;
    const data = mp.players.get(player);

    if (data.dbId) {
      const isDead = data.dead;

      if (isDead) emsCalls.cancelCall(data.dbId);

      offers.refuse(data);
      finishWork(data);

      await CharModel.findByIdAndUpdate(data.dbId, {
        $set: {
          position,
          inventory: data.inventory,
          hunger: data.hunger,
          health: isDead ? 0 : health,
          paydayTime: data.paydayTime,
          bonusTime: data.bonusTime,
          cuffed: player.getVariable('cuffs') || false,
        },
        $inc: {
          playedTime: moment().diff(data.loginAt, 'minutes'),
        },
      });
    }

    mp.players.delete(id);
  }
}

const events = new PlayerEvents();
