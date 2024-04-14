import hud from 'basic/hud';

const player = mp.players.local;

const atms = [
  mp.game.joaat('prop_atm_01'),
  mp.game.joaat('prop_atm_02'),
  mp.game.joaat('prop_atm_03'),
  mp.game.joaat('prop_fleeca_atm'),
];

class ATM {
  private isNearATM: boolean = false;

  constructor() {
    mp.events.subscribeToDefault({ render: this.render.bind(this) });
  }

  private nearestATM() {
    for (let i = 0; i < atms.length; i++) {
      const atmHash = atms[i];
      var check = mp.game.object.getClosestObjectOfType(
        player.position.x,
        player.position.y,
        player.position.z,
        0.75,
        atmHash,
        false,
        true,
        true
      );

      if (check) {
        return true;
      }
    }

    return false;
  }

  private render() {
    if (this.nearestATM()) {
      if (!this.isNearATM) {
        this.isNearATM = true;
        hud.showInteract('E');
      }

      if (mp.game.controls.isControlJustPressed(2, 51))
        mp.events.callServer('Bank-KeyPress');
    } else if (!this.nearestATM() && this.isNearATM) {
      this.isNearATM = false;
      hud.showInteract();
    }
  }
}

export default new ATM();
