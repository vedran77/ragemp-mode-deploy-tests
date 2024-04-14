import animations from 'helpers/animations';
import money from 'helpers/money';
import hunger from 'player/hunger';

class VendingMachine {
  constructor() {
    mp.events.subscribe({
      'VendingMachine-Buy': this.buy.bind(this),
    });
  }

  private async buy(player: Player, type: string) {
    switch (type) {
      case 'drink':
        await money.change(player, 'cash', -2, 'vending machine - drink');

        animations.playOnServer(player.mp, 'buy_soda', 2000);

        setTimeout(() => {
          hunger.eat(player, {
            name: 'soda',
            amount: 1,
            cell: -1,
          });
        }, 2000);
        break;

      case 'snack':
        await money.change(player, 'cash', -5, 'vending machine - snack');

        animations.playOnServer(player.mp, 'buy_snack', 2000);

        setTimeout(() => {
          hunger.eat(player, {
            name: 'chocolate',
            amount: 1,
            cell: -1,
          });
        }, 2000);
        break;
    }
  }
}

export default new VendingMachine();
