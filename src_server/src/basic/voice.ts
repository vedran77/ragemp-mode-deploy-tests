import { chatErrorMessages } from 'helpers/commands';

class Voice {
  constructor() {
    mp.events.add({
      'Voice-AddListener': this.addListenerFor,
      'Voice-RemoveListener': this.removeListenerFor,
    });

    mp.events.addCommand('meg', this.toggleMegaphone.bind(this));
  }

  addListenerFor(player: PlayerMp, target: PlayerMp) {
    player.enableVoiceTo(target);
  }

  removeListenerFor(player: PlayerMp, target: PlayerMp) {
    player.disableVoiceTo(target);
  }

  toggleMegaphone(entity: PlayerMp) {
    const player = mp.players.get(entity);

    const { vehicle } = player.mp;

    if (
      !vehicle ||
      (vehicle?.getOccupant(-1)?.id !== player?.mp?.id &&
        vehicle?.getOccupant(0)?.id !== player?.mp?.id)
    ) {
      return player.mp.outputChatBox(
        chatErrorMessages.error(
          'Moraš biti vozač ili suvozač da bi koristio megafon!'
        )
      );
    }

    player.callEvent('Voice-ToggleMegaphone');
  }
}

export default new Voice();
