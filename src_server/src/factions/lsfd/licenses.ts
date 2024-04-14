import money from 'helpers/money';
import offers from 'helpers/offers';
import playerLicenses from 'player/licenses';
import ems from 'factions/lsfd';

const licenses = {
  physical: {
    name: 'Fizičko zdravlje',
    price: 6000,
  },
  mental: {
    name: 'Psihičko zdravlje',
    price: 6000,
  },
};

class EmsLicenses {
  constructor() {
    mp.events.subscribe({
      'EmsLicenses-OfferLicense': this.offerToBuy.bind(this),
    });
  }

  private offerToBuy(player: Player, type: keyof typeof licenses) {
    if (!ems.isAlreadyAtWork(player)) return;

    const license = licenses[type];
    const customer = mp.players.get(player.target as PlayerMp);

    if (!license || !customer) return;

    offers.create(player, customer, {
      onAccept: this.onConfirmOffer.bind(this, customer, type),
    });
    offers.showWithExpires(
      customer,
      player.mp.id,
      `Lekar vam je ponudio lekarsko uverenje "${license.name}" za ${license.price}$`
    );
  }

  private async onConfirmOffer(customer: Player, type: keyof typeof licenses) {
    const license = licenses[type];
    if (!license) throw new SilentError('wrong license type');

    const { price } = license;
    await money.change(customer, 'cash', -price, 'buy ems license');
    await ems.money.changeBalance(price);

    await playerLicenses.give(customer, `med_${type}`);
  }
}

const emsLicenses = new EmsLicenses();
