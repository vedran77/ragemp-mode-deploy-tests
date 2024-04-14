class SpamResistor {
  private timeLimit: number;
  private players: Map<string, number>;

  constructor(ms: number) {
    this.setTimeLimit(ms);
  }

  isEnded(player: Player) {
    const time = this.players.get(player.dbId);
    return !time || Date.now() >= time;
  }

  setTimeLimit(ms: number) {
    this.timeLimit = ms;
    this.reset();
  }

  apply(player: Player) {
    this.players.set(player.dbId, Date.now() + this.timeLimit);
  }

  reset(player?: Player) {
    if (player) this.players.delete(player.dbId);
    else this.players = new Map();
  }
}

export default SpamResistor;
