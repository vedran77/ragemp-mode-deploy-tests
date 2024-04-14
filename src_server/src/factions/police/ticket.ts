import money from 'helpers/money';
import offers from 'helpers/offers';
import police from 'factions/police';
import sheriff from 'factions/sheriff';

import './wanted';
import { wantedList } from './wanted';
import hud from 'helpers/hud';

type TicketData = {
  sum: number;
  reason: string;
};

class Ticket {
  private maxSum: number;

  constructor() {
    this.maxSum = 12000;

    mp.events.subscribe({
      'Police-WriteTicket': this.writeForPlayer.bind(this),
    });
  }

  private async writeForPlayer(
    player: Player,
    userId: string,
    data: TicketData
  ) {
    console.log(
      police.isAlreadyAtWork(player),
      sheriff.isAlreadyAtWork(player)
    );
    if (!police.isAlreadyAtWork(player) && !sheriff.isAlreadyAtWork(player))
      throw new SilentError('access denied');

    const target = mp.players.getByDbId(userId);
    const sum = parseInt(data?.sum as any, 10);

    if (!target || sum <= 0 || sum > this.maxSum) {
      throw new SilentError('wrong data');
    }

    offers.create(player, target, {
      onAccept: this.payTicket.bind(this, target, sum, player.faction),
      onRefuse: this.refuseTicket.bind(this, player, target),
    });
    offers.showWithExpires(
      target,
      player.mp.id,
      `Ponudjeno vam je da platite kaznu: ${sum}$. Prekrsaj je: ${data.reason}`
    );
  }

  private async payTicket(customer: Player, sum: number, faction: string) {
    await money.change(customer, 'cash', -sum, 'pay ticket');

    if (faction === 'lspd') {
      await police.money.changeBalance(sum);
    } else if (faction === 'lssd') {
      await sheriff.money.changeBalance(sum);
    }
  }

  private async refuseTicket(player: Player, target: Player) {
    hud.showNotification(player, 'info', 'Igrac je odbio kaznu.', true);
    hud.showNotification(target, 'info', 'Odbili ste kaznu.', true);
  }
}

const ticket = new Ticket();
