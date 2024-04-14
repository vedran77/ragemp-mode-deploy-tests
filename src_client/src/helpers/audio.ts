class PlayerAudio {
  constructor() {
    mp.events.add({
      'PlayerAudio-Play': this.play.bind(this),
      'PlayerAudio-PlayPoliceReport': this.playPoliceReport.bind(this),
    });
  }

  public play(soundName: string, soundSetName: string) {
    mp.game.audio.playSoundFrontend(-1, soundName, soundSetName, true);
  }

  public playPoliceReport(report: string | string[]) {
    mp.console.logInfo(` ${report}`);
    if (Array.isArray(report)) {
      report.forEach((r) => {
        mp.game.audio.playPoliceReport(r, 0);
      });
    } else {
      mp.game.audio.playPoliceReport(report, 0.0);
    }
  }
}

export default new PlayerAudio();
