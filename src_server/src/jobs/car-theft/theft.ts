import hud from 'helpers/hud';
import policeCalls from 'factions/police/calls';
import Branch from '../branch';
import Vehicle from '../vehicle';

class Theft extends Branch {
  private vehicle: Vehicle;

  constructor(type: string, salary: number, vehicle: Vehicle) {
    super(type, salary);

    mp.events.subscribeToDefault({
      playerUnlockVehicle: this.onUnlockVehicle.bind(this),
    });

    this.vehicle = vehicle;
  }

  startWork(player: Player) {
    if (this.workers.amount > 3) {
      hud.showNotification(
        player,
        'error',
        'Trenutno imamo previše ljudi koji su u poslu!',
        true
      );
      throw new SilentError('limit of workers');
    }

    super.startWork(player);

    const worker = this.workers.get(player);

    this.vehicle.spawn(player, worker, false);
    mp.blips.create(
      worker.vehicle.position,
      { model: 0, color: 2, name: 'Checkpoint' },
      player
    );
  }

  finishWork(player: Player) {
    const worker = this.workers.get(player);

    if (worker.vehicle) {
      policeCalls.deleteCall(player, 't' + worker.vehicle.id.toString());
      this.vehicle.destroy(worker);
      mp.blips.delete(player, 'Checkpoint');
    }

    super.finishWork(player);
  }

  protected async onEnterPoint(player: Player) {
    if (
      !this.vehicle.isOwnedByWorker(this.workers.get(player), player.mp.vehicle)
    )
      return;

    await this.completeOrder(player);

    this.finishWork(player);
  }

  private onUnlockVehicle(player: Player, vehicle: VehicleMp) {
    if (!this.vehicle.isOwnedByWorker(this.workers.get(player), vehicle))
      return;

    this.createOrder(player);

    hud.showNotification(
      player,
      'info',
      'Odlično! Dostavite vozilo na lokaciju označenu na mapi.'
    );
  }
}

export default Theft;
