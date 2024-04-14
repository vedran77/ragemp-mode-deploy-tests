import hud from 'helpers/hud';
import VehicleModel from 'models/Vehicle';

class VehiclePark {
  constructor() {
    mp.events.subscribe({
      'Vehicle-Park': this.park.bind(this),
    });
  }

  async park(player: Player, vehicle: VehicleMp) {
    if (!vehicle) return;

    if (vehicle.owner.player !== player.dbId) {
      hud.showNotification(player, 'error', 'Ovo nije vaše vozilo', true);
      throw new SilentError('Not your vehicle');
    }

    const vehData = await VehicleModel.findOne({ _id: vehicle.dbId });

    if (!vehData) return;

    vehData.position = {
      position: vehicle.position,
      rotation: vehicle.heading,
    };
    vehData.save();

    hud.showNotification(player, 'info', 'Vozilo je parkirano', true);
  }
}

export default new VehiclePark();
