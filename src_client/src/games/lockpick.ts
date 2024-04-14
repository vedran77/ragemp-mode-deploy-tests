import scenarios from 'basic/scenarios';
import vehicleTuning from 'vehicle/tuning';

class Lockpick {
  private target?: VehicleMp | number;
  private events?: {
    onSuccess: string;
    onError: string;
    onCancel?: string;
  };

  constructor() {
    mp.events.subscribe({
      'Lockpick-ShowMenu': this.showMenu.bind(this),
      'Lockpick-Error': this.onError.bind(this),
      'Lockpick-Success': this.onSuccess.bind(this),
      'Lockpick-Cancel': this.cancel.bind(this),
    });
  }

  showMenu(
    target: VehicleMp | number,
    events: {
      onSuccess: string;
      onError: string;
      onCancel?: string;
    },
    level?: number
  ) {
    this.target = target;
    this.events = events;

    const lock =
      (typeof target !== 'number' && vehicleTuning.get(target)?.lock) ?? -1;
    const levels = {
      '-1': 3,
      '0': 6,
      '1': 9,
    };

    mp.browsers.showPage(
      'games/lockpick',
      { need: level || levels[lock] },
      true,
      true
    );
    mp.browsers.setHideBind(this.cancel.bind(this));
    mp.game.ui.displayRadar(true);
    mp.gui.chat.show(true);
  }

  onSuccess() {
    if (!this.events.onSuccess) return;

    mp.events.callServer(this.events.onSuccess, this.target, false);

    this.cancel(true);
  }

  onError() {
    if (!this.events.onError) return;

    mp.events.callServer(this.events.onError, this.target, false);
    mp.game.ui.notifications.show('error', 'Aktivirali ste alarm na vozilu!');

    this.cancel(true);
  }

  private cancel(error = false) {
    if (this.events.onCancel && !error)
      mp.events.callServer(this.events.onCancel, this.target, false);

    this.target = null;

    scenarios.stopLocal();
    mp.browsers.hidePage();
  }
}

const lockpick = new Lockpick();
