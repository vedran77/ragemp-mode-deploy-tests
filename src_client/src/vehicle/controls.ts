import binder from 'utils/binder';
import vehicleState from './state';
import vehicleCtrl from './index';
import './seats';

enum Door {
  FRONT_LEFT = 0,
  FRONT_RIGHT = 1,
  REAR_LEFT = 2,
  REAR_RIGHT = 3,
  HOOD = 4,
  TRUNK = 5,
  REAR = 6,
  REAR2 = 7,
}

const player = mp.players.local;

class VehicleControls {
  constructor() {
    this.subscribeToEvents();
    this.bindKeys();
  }

  get seatbelt() {
    return !player.getConfigFlag(32, true);
  }

  toggleLockStatus(target?: VehicleMp) {
    const vehicle: VehicleMp = target ?? vehicleCtrl.getNearestInRange(5);

    if (vehicle) mp.events.callServer('Vehicle-ToggleLock', vehicle, false);
  }

  toggleDoor(vehicle: VehicleMp, door: keyof typeof Door) {
    const doors = [];
    const doorId = Door[door];

    for (let y = 0; y < 8; y++) {
      if (vehicle.getDoorAngleRatio(y) > 0.1) doors.push(1);
      else doors.push(0);
    }

    doors[doorId] = doors[doorId] ? 0 : 1;

    mp.events.callServer('Vehicle-ToggleDoor', [vehicle, doors], false);
  }

  toggleIndicator(indicator: 'left' | 'right') {
    const blockedClasses = [13, 14, 15, 16, 21];
    const { vehicle } = player;

    if (
      mp.browsers.hud &&
      vehicle &&
      vehicle.getPedInSeat(-1) === player.handle &&
      blockedClasses.indexOf(vehicle.getClass()) === -1
    )
      mp.events.callServer(
        'Vehicle-ToggleIndicator',
        [vehicle, indicator],
        false
      );
  }

  toggleSeatBelt() {
    if (!player.vehicle) return;

    player.setConfigFlag(32, this.seatbelt);

    mp.game.ui.notifications.show(
      'info',
      this.seatbelt ? 'Vezali ste pojas' : 'Odvezali ste pojas'
    );
  }

  private toggleEngine() {
    const { vehicle } = player;

    if (
      mp.browsers.hud &&
      !mp.players.local.isTypingInTextChat &&
      vehicleCtrl.isDriver(vehicle)
    ) {
      mp.events.callServer('Vehicle-ToggleEngine', vehicle, false);
    }
  }

  private toggleSirenSilent() {
    if (!mp.browsers.hud || player.isTypingInTextChat) return;

    const { vehicle } = player;

    const state = vehicleState.get(vehicle);

    if (!vehicleCtrl.isDriver(vehicle) || vehicle.getClass() !== 18) return;

    vehicle.setSirenSound(state.sirenSilent);
    vehicle.setSiren(true);
    mp.events.callServer('Vehicle-ToggleSirenSilent', vehicle, false);
  }

  private bindKeys() {
    binder.bind('engine', 'B', this.toggleEngine);
    binder.bind('lock', 'L', () => mp.browsers.hud && this.toggleLockStatus());
    binder.bind(
      'seatbelt',
      'J',
      () => mp.browsers.hud && this.toggleSeatBelt()
    );
    binder.bind('sirenSilent', 'K', this.toggleSirenSilent);

    binder.bind('left_ind', 'Left', this.toggleIndicator.bind(this, 'left'));
    binder.bind('right_ind', 'Right', this.toggleIndicator.bind(this, 'right'));
  }

  private subscribeToEvents() {
    mp.events.subscribeToDefault({
      render: () => {
        mp.game.controls.disableControlAction(0, 23, true);
        mp.game.controls.disableControlAction(0, 58, true);
      },
      playerLeaveVehicle: () => player.setConfigFlag(32, true),
    });
  }
}

export default new VehicleControls();
