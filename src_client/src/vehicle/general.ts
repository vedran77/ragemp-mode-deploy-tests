class VehicleGeneral {
  constructor() {
    mp.events.add({
      'Vehicle-DamageTyre': this.damageTyre.bind(this),
      'Vehicle-RadarSpeeding': this.radarSpeeding.bind(this),
    });
  }

  private damageTyre(vehicle: VehicleMp) {
    vehicle.setTyreBurst(0, false, 1000);
    vehicle.setTyreBurst(1, false, 1000);
    vehicle.setTyreBurst(4, false, 1000);
    vehicle.setTyreBurst(5, false, 1000);
    vehicle.setBurnout(true);

    setTimeout((_) => {
      vehicle.setBurnout(false);
    }, 2000);
  }

  private radarSpeeding(vehicle: VehicleMp, speedLimit: number) {
    const player = mp.players.local;
    if (
      !vehicle ||
      [14, 15, 16, 18].includes(vehicle.getClass()) ||
      (['lspd', 'lssd', 'lsfd'].includes(player.getVariable('faction')) &&
        player.getVariable('factionWork'))
    )
      return;

    const speed = vehicle.getSpeed() * 3.6;

    if (speedLimit + 30 > speed) return;

    const speeding = (speed - speedLimit).toFixed(0);
    const vehName = mp.game.vehicle.getDisplayNameFromVehicleModel(
      vehicle.model
    );

    mp.events.callRemote(
      'PoliceCalls-CreateCallout',
      JSON.stringify({
        id: 'r' + player.remoteId.toString(),
        message: `Prekoračenje dozvoljene brzine od ${speedLimit} za ${speeding} km/h. Vozilo marke: ${vehName}, registarskih oznaka: ${vehicle.getNumberPlateText()}`,
        position: player.position,
      }),
      false
    );

    mp.gui.chat.push(
      `!{95e800}[RADAR]: !{ffffff}Prekoračili ste dozvoljenu brzinu od ${speedLimit} za ${speeding} km/h! Vaš prekršaj je zabeležen.`
    );
  }
}

export default new VehicleGeneral();
