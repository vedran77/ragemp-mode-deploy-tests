import hud from 'basic/hud';
import { min } from 'moment';
import { fromObject } from 'utils/vector';

type PointData = {
  marker: MarkerMp;
  event?: string;
  vehicle?: VehicleMp;
};

class Cargo {
  private points?: Map<number, ColshapeMp>;

  constructor() {
    this.points = new Map();

    mp.events.subscribe({
      'Cargo-ShowVehiclePoint': this.showVehiclePoint.bind(this),
      'Cargo-RemoveVehiclePoint': this.removePoint.bind(this),
    });
  }

  removePoint(vehicle: VehicleMp) {
    if (!this.points.size || !this.points.has(vehicle.id)) return;

    const colshape = this.points.get(vehicle.id);
    const { marker }: PointData = mp.colshapes.getData(colshape);

    marker.destroy();
    hud.showInteract();
    mp.colshapes.destroy(colshape);
    this.points.delete(vehicle.id);
  }

  private showVehiclePoint(vehicle: VehicleMp, callbackEvent?: string) {
    if (!vehicle || this.points.has(vehicle.id)) return;

    const { min } = mp.game.gameplay.getModelDimensions(vehicle.model);
    const position = vehicle.getOffsetFromInWorldCoords(0, min.y - 0.5, -1);

    const marker = mp.markers.new(1, position, 2, {
      dimension: vehicle.dimension,
      color: [21, 253, 105, 100],
    });

    const point = mp.colshapes.create(
      position,
      2,
      {
        onEnter: () => hud.showInteract('E'),
        onKeyPress: this.onKeyPress.bind(this),
        onExit: () => hud.showInteract(),
      },
      {
        event: callbackEvent,
        marker,
        vehicle,
      }
    );

    this.points.set(vehicle.id, point);
  }

  private async onKeyPress(data: PointData) {
    const { event, vehicle } = data;

    try {
      if (event) await mp.events.callServer(event, vehicle);

      // this.removePoint();
    } catch (err) {}
  }
}

export default new Cargo();
