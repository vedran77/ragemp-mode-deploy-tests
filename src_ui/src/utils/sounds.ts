class Sounds {
	private url = process.env.REACT_APP_ASSETS_SERVICE;
	private audio?: HTMLAudioElement;

	playPayment(type: 'bank' | 'cash') {
		this.audio = new Audio(`${this.url}/audio/${type === 'bank' ? 'bank-pay' : 'cash-pay'}.mp3`);

		this.audio.play();
	}

	play(name: string, volume = 1.0) {
		this.audio = new Audio(`${this.url}/audio/${name}.mp3`);
		this.audio.volume = volume;

		this.audio.play();
	}

	pause() {
		if (this.audio) this.audio.pause();
	}
}

export default new Sounds();
