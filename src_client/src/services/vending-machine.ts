import hud from 'basic/hud';

const player = mp.players.local;

const machines = [
  mp.game.joaat('prop_vend_soda_01'),
  mp.game.joaat('prop_vend_soda_02'),
  mp.game.joaat('prop_vend_snak_01'),
];

class VendingMachine {
  private isNearMachine: boolean = false;
  private isBuying: boolean = false;
  private type: string;

  constructor() {
    mp.events.subscribeToDefault({ render: this.render.bind(this) });
  }

  private nearestMachine() {
    for (let i = 0; i < machines.length; i++) {
      const atmHash = machines[i];
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
        this.type = i === 2 ? 'snack' : 'drink';

        return true;
      }
    }

    return false;
  }

  private render() {
    if (this.nearestMachine()) {
      if (!this.isNearMachine) {
        this.isNearMachine = true;
        hud.showInteract('E');
      }

      if (
        mp.game.controls.isControlJustPressed(2, 51) &&
        !this.isBuying &&
        !player.getVariable('isPlayingAnim')
      ) {
        this.isBuying = true;
        mp.events.callServer('VendingMachine-Buy', this.type, false);

        setTimeout(() => {
          this.isBuying = false;
        }, 8000);
      }
    } else if (!this.nearestMachine() && this.isNearMachine) {
      this.isNearMachine = false;
      hud.showInteract();
    }
  }
}

export default new VendingMachine();
