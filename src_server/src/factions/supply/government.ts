import chat from 'basic/chat';
import { Strategy } from './index';
import MaterialsLoading from './loading';
import factions from 'factions';
import { chatErrorMessages } from 'helpers/commands';

class GovernmentSupply implements Strategy {
  private materials: number;

  private loading: MaterialsLoading;

  constructor() {
    this.materials = 0;
    this.loading = new MaterialsLoading(
      { x: -2119.767, y: 3240.074, z: 32.81 },
      this
    );
  }

  get materialsLeft() {
    return this.materials;
  }

  showPoints() {
    this.loading.togglePoint(true);
  }

  hidePoints() {
    this.loading.togglePoint(false);
  }

  notifyAboutOrder() {
    setTimeout(() => {
      Object.values(factions.items).forEach(
        (item) =>
          item.government &&
          chat.sendToFaction(
            item,
            chatErrorMessages.custom(
              'GOV-INFO',
              'Materijali su stigli u skladište i spremni su za preuzmimanje.'
            )
          )
      );
    }, 10000);
  }

  changeMaterials(amount: number) {
    this.materials += amount;

    if (this.materials <= 0) this.stopSupply();
  }

  private stopSupply() {
    this.materials = 0;

    this.hidePoints();
    this.loading.stopLoading();
  }
}

export default GovernmentSupply;
