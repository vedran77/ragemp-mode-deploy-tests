const localPlayer = mp.players.local;

const maxSpeed = 10.0;
const minHeight = 15.0;
const maxHeight = 45.0;
const maxAngle = 15.0;

class Rappel {
  constructor() {
    mp.keys.bind(80, true, () => {
      if (mp.gui.cursor.visible) return;

      this.startRappel();
    });
  }

  startRappel() {
    const { vehicle } = localPlayer;

    if (!mp.game.invoke('0x4E417C547182C84D', vehicle.handle)) return;

    if (vehicle.getSpeed() > maxSpeed) return;

    if (
      vehicle.getPedInSeat(-1) === localPlayer.handle ||
      vehicle.getPedInSeat(0) === localPlayer.handle
    )
      return;

    const taskStatus = localPlayer.getScriptTaskStatus(-275944640);
    if (taskStatus === 0 || taskStatus === 1) return;

    const curHeight = vehicle.getHeightAboveGround();

    if (curHeight < minHeight || curHeight > maxHeight) return;

    if (!vehicle.isUpright(maxAngle) || vehicle.isUpsidedown()) return;

    localPlayer.clearTasks();
    localPlayer.taskRappelFromHeli(10.0);
  }
}

export default new Rappel();
