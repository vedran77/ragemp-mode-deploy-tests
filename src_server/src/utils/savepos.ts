import fs from 'fs';
import rpc from 'rage-rpc';

class Savepos {
  constructor() {
    mp.events.addCommand({
      savepos: this.savePlayerPosition,
      savecam: this.saveCameraPosition,
    });
  }

  savePlayerPosition(player: PlayerMp, name: string) {
    const { position, heading, vehicle } = player;

    if (vehicle)
      console.log('veh', { ...vehicle.position, rot: vehicle?.heading });
    if (position) console.log('pos', { ...position, rot: heading });

    fs.readFile('savedposplayer.json', 'utf8', (err, data) => {
      if (err) return console.log(err);

      const list = JSON.parse(data);

      list.push({
        name,
        position,
        rotation: heading,
        vehHead: vehicle?.heading,
      });

      fs.writeFile(
        'savedposplayer.json',
        JSON.stringify(list),
        'utf8',
        (error) => {
          if (!error) player.notify(`~g~Player position saved. ~w~(${name})`);
        }
      );
    });
  }

  async saveCameraPosition(player: PlayerMp, name: string) {
    const { position, point } = await rpc.callClient(player, 'getCamCoords');

    console.log('cam', { ...position, point });

    fs.readFile('savedposcam.json', 'utf8', (err, data) => {
      if (err) return console.log(err);

      const list = JSON.parse(data);

      list.push({ name, position, point });

      fs.writeFile(
        'savedposcam.json',
        JSON.stringify(list),
        'utf8',
        (error) => {
          if (!error) player.notify(`~g~PositionCam saved. ~w~(${name})`);
        }
      );
    });
  }
}

const savepos = new Savepos();
