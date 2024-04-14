import animations from 'helpers/animations';
import attachments from 'helpers/attachments';
import Branch from '../branch';
import Vehicle from '../vehicle';
import { Worker } from '../workers';
import { clothes, vehiclePositions } from './data';
import { chatErrorMessages } from 'helpers/commands';
import hud from 'helpers/hud';

class Starter extends Branch {
  private vehicle: Vehicle;

  constructor() {
    super('Starter', 1000, clothes);

    mp.events.subscribe({
      'TruckerStarter-HandleCargo': this.handleCargo.bind(this),
    });

    mp.events.subscribeToDefault({
      playerEnterVehicle: this.onEnterVehicle.bind(this),
      playerExitVehicle: this.onExitVehicle.bind(this),
    });

    this.vehicle = new Vehicle(
      ['pounder'],
      vehiclePositions.Starter,
      [20, 60, 16, 0]
    );
  }

  createPoints(coords: PositionEx[]) {
    this.points.createForOrder(
      { x: 1246.206, y: -3175.11, z: 5.63 },
      3,
      this.getCargo.bind(this)
    );

    super.createPoints(coords, 4);
  }

  startWork(player: Player) {
    super.startWork(player);

    player.mp.outputChatBox(
      chatErrorMessages.custom(
        'POSAO',
        'Kamion je na parkingu, odvezi ga na utovar i utovari kutije.'
      )
    );

    this.vehicle.spawn(player, this.workers.get(player));
    this.points.show(player);
  }

  finishWork(player: Player) {
    this.cancelOrder(player);
    this.vehicle.destroy(this.workers.get(player));

    super.finishWork(player);
  }

  protected cancelOrder(player: Player) {
    attachments.remove(player.mp, 'card_box');
    animations.stopOnServer(player.mp);

    this.hideCargoPoint(player);

    super.cancelOrder(player);
  }

  private playerHasBox(player: PlayerMp) {
    return attachments.has(player, 'card_box');
  }

  private onEnterVehicle(player: Player, vehicle: VehicleMp) {
    const worker = this.workers.get(player);

    if (vehicle?.id === worker?.vehicle?.id) {
      this.hideCargoPoint(player);
    }
  }

  private onExitVehicle(player: Player, vehicle: VehicleMp) {
    const worker = this.workers.get(player);

    if (vehicle?.id === worker?.vehicle?.id && worker.cargo > 0) {
      this.showCargoPoint(player);
    }
  }

  protected async onEnterPoint(player: Player) {
    const worker = this.workers.get(player);

    if (player.mp.vehicle) {
      return player.mp.outputChatBox(
        chatErrorMessages.custom(
          'POSAO',
          'Parkirajte kamion i istovarite kutije iz njega.'
        )
      );
    }

    attachments.remove(player.mp, 'card_box');
    animations.stopOnServer(player.mp);

    if (worker.cargo === 0) {
      this.hideCargoPoint(player);
      await super.completeOrder(player);

      this.points.show(player);
    }
  }

  private isEnoughCargo(worker: Worker) {
    return worker.cargo >= 5;
  }

  private addCargoToVehicle(player: Player) {
    if (player.mp.vehicle) return;

    const worker = this.workers.get(player);

    if (!worker || !this.playerHasBox(player.mp)) {
      throw new SilentError("player doesn't have box");
    }

    worker.cargo += 1;

    attachments.remove(player.mp, 'card_box');
    animations.stopOnServer(player.mp);

    if (this.isEnoughCargo(worker)) {
      this.points.hide(player);
      this.createOrder(player);

      this.hideCargoPoint(player);
      player.mp.outputChatBox(
        chatErrorMessages.custom('POSAO', 'Dostavi robu na oznacenu lokaciju.')
      );
    }
  }

  private getCargoFromVehicle(player: Player) {
    if (player.mp.vehicle) return;

    const worker = this.workers.get(player);

    if (!worker || this.playerHasBox(player.mp)) {
      throw new SilentError('player have box');
    }

    if (worker.cargo === 0) {
      hud.showNotification(player, 'info', 'Nemate kutija u kamionu!');
      return;
    }

    worker.cargo -= 1;

    animations.playOnServer(player.mp, 'hold_box');
    attachments.add(player.mp, 'card_box');
  }

  private handleCargo(player: Player) {
    const { vehicle } = this.workers.get(player);

    if (!vehicle) return;

    if (this.playerHasBox(player.mp)) {
      this.addCargoToVehicle(player);
    } else {
      this.getCargoFromVehicle(player);
    }
  }

  private getCargo(player: Player) {
    if (player.mp.vehicle) return;

    animations.playOnServer(player.mp, 'hold_box');
    attachments.add(player.mp, 'card_box');

    this.showCargoPoint(player);
  }

  private showCargoPoint(player: Player) {
    const { vehicle } = this.workers.get(player);

    player.callEvent('Cargo-ShowVehiclePoint', [
      vehicle,
      'TruckerStarter-HandleCargo',
    ]);
  }

  private hideCargoPoint(player: Player) {
    const { vehicle } = this.workers.get(player);

    player.callEvent('Cargo-RemoveVehiclePoint', vehicle);
  }
}

export default new Starter();
