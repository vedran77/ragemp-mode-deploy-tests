import speedometer from './speedometer';
import vehicleState from './state';
import vehicleTuning from './tuning';

const player = mp.players.local;

class VehicleSync {
  private radioSyncInterval?: NodeJS.Timeout;

  constructor() {
    this.subscribeToEvents();
  }

  syncTuning(vehicle: VehicleMp) {
    const tuning = vehicleTuning.get(vehicle);

    if (tuning) vehicleTuning.set(vehicle, tuning);
  }

  private syncSiren(vehicle: VehicleMp) {
    const state = vehicleState.get(vehicle);

    // Police Siren
    if (vehicle.getClass() !== 18) return;

    if (state) {
      vehicleState.setSirenSilentStatus(vehicle, state.sirenSilent);
    }
  }

  private syncForStreamingIn(vehicle: VehicleMp) {
    if (!vehicle || vehicle.type !== 'vehicle') return;

    const state = vehicleState.get(vehicle);

    vehicle.setTyresCanBurst(true);
    vehicle.setCanBeDamaged(true);
    vehicle.setInvincible(false);

    if (state) {
      vehicleState.setHealth(vehicle, state.health.body, state.health.engine);
      vehicleState.setLockStatus(vehicle, state.locked);
      vehicleState.setDoorsState(vehicle, state.doors);
      vehicleState.setDirtLevel(vehicle, 0);
      vehicleState.setTurnSignalsStatus(
        vehicle,
        state.indicators.left,
        state.indicators.right
      );
      vehicleState.setEngineState(vehicle, state.engine, true);
    }

    this.syncSiren(vehicle);
    this.syncTuning(vehicle);
  }

  private syncRadioStation() {
    const { vehicle } = player;
    const state = vehicleState.get(vehicle);

    if (vehicle || !state) return;

    const radioIndex = mp.game.invoke('0xE8AF77C4C06ADC93');

    if (
      vehicle.getPedInSeat(-1) === player.handle &&
      state.radioIndex !== radioIndex
    ) {
      mp.events.callServer(
        'VehicleSync-SetRadioStation',
        [vehicle, radioIndex],
        false
      );
    } else if (state.radioIndex === 255) {
      mp.game.audio.setRadioToStationName('OFF');
    } else {
      mp.game.audio.setFrontendRadioActive(true);
      mp.game.audio.setRadioToStationIndex(state.radioIndex);
    }
  }

  private onEnterInVehicle(vehicle: VehicleMp) {
    mp.game.vehicle.defaultEngineBehaviour = false;
    player.setConfigFlag(429, true);

    const state = vehicleState.get(vehicle);

    if (!state) return;

    this.stopRadioSync();
    this.radioSyncInterval = setInterval(this.syncRadioStation, 1000);

    vehicle.setEngineOn(state.engine, true, true);
    vehicle.setUndriveable(!state.engine);
    vehicle.setCanBeDamaged(true);
    vehicle.setInvincible(false);
    vehicle.setDirtLevel(0);

    speedometer.show();
  }

  private onLeaveFromVehicle(vehicle: VehicleMp) {
    const state = vehicleState.get(vehicle);

    if (!state) return;

    this.stopRadioSync();

    vehicle.setEngineOn(state.engine, true, true);
    vehicle.setUndriveable(!state.engine);
    vehicle.setCanBeDamaged(true);
    vehicle.setInvincible(false);
    vehicle.setDirtLevel(0);
  }

  private stopRadioSync() {
    if (this.radioSyncInterval) {
      clearInterval(this.radioSyncInterval);
      this.radioSyncInterval = null;
    }
  }

  private subscribeToEvents() {
    mp.events.subscribeToDefault({
      entityStreamIn: this.syncForStreamingIn.bind(this),
      playerEnterVehicle: this.onEnterInVehicle.bind(this),
      playerLeaveVehicle: this.onLeaveFromVehicle.bind(this),
    });

    mp.events.subscribe({
      'VehicleSync-SetLockStatus': vehicleState.setLockStatus,
      'VehicleSync-SetDoorsState': vehicleState.setDoorsState,
      'VehicleSync-SetHealth': vehicleState.setHealth,
      'VehicleSync-SetIndicators': vehicleState.setTurnSignalsStatus,
    });

    mp.events.subscribeToData({
      tuning: this.syncTuning,
      state: this.syncSiren,
    });
  }
}

export default new VehicleSync();
