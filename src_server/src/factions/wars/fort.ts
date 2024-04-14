import chat from 'basic/chat';
import MaterialsLoading from './loading';
import factions from 'factions';
import { chatErrorMessages } from 'helpers/commands';

const position = {
  x: 465.53863525390625,
  y: -3128.939697265625,
  z: 6.069428443908691,
};

let intervalTime = 60;

class FortWar {
  private materials: number;
  private blip?: BlipMp | null = null;
  private loading: MaterialsLoading;
  private timerNotification?: NodeJS.Timeout | null = null;

  constructor() {
    this.materials = 0;
    this.loading = new MaterialsLoading(position, this);
  }

  get isStarted() {
    return this.materials > 0;
  }

  start() {
    if (this.isStarted) throw new SilentError('war is already started');

    intervalTime = 60;
    this.materials = 15_000;

    this.blip = mp.blips.create(position, {
      name: 'Rat za Materijale',
      model: 303,
      color: 1,
      scale: 0.7,
    });

    this.loading.togglePoint(true);
    this.notifyFactions('Najavljen je napad na Skladište Materijala');

    this.timerNotification = setInterval(() => {
      intervalTime -= 10;

      this.notifyFactions(
        `Napad na Skladište Materijala se završava za ${intervalTime} minuta.`
      );
    }, 10 * 60 * 1000);

    setTimeout(() => {
      this.end();
    }, 60 * 60 * 1000);
  }

  end() {
    this.materials = 0;

    this.blip?.destroy();
    this.blip = null;

    this.loading.togglePoint(false);
    this.loading.stopLoading();

    if (this.timerNotification) {
      clearInterval(this.timerNotification);
      this.timerNotification = null;
    }

    this.notifyFactions('Napad na Skladište Materijala završio.');
  }

  changeMaterials(amount: number) {
    this.materials += amount;

    if (this.materials <= 0) this.end();
  }

  private notifyFactions(message: string) {
    Object.values(factions.items).forEach((faction) => {
      if (faction.government) return;

      chat.sendToFaction(
        faction,
        chatErrorMessages.custom('WAR-INFO', message)
      );
    });
  }
}

export default new FortWar();
