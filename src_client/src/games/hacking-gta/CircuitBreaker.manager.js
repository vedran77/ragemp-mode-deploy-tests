const { default: hud } = require('basic/hud');
const { CircuitBreaker } = require('./CircuitBreaker');

class CircuitBreakerManager {
	constructor() {
		this.game = null;
	}
	start(lives, difficulty, levels, events) {
		if (this.game !== null) return; // Cannot start twice
		this.game = new CircuitBreaker(
			lives,
			difficulty,
			levels,
			events,
			() => {
				this.game = null;
			}
		);

		hud.visible = false;
	}
	handleRender() {
		if (this.game === null) return;
		this.game.tick();
	}
}
exports.clientCircuitBreakerManager = new CircuitBreakerManager();
