class Particles {
	constructor() {
		mp.events.subscribe({
			'Particles-ShowSmoke': this.showSmoke.bind(this),
			'Particles-Create': this.createFx.bind(this),
			'Particles-CreateOnBone': this.createFxOnBone.bind(this),
		});
	}

	async showSmoke(player: PlayerMp, duration: number) {
		await this.createFxOnBone(
			'core',
			'exp_grd_bzgas_smoke',
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: 0, z: 0 },
			0.3,
			player,
			player.getBoneIndex(20178),
			duration
		);
	}

	private async createFx(
		name: string,
		effect: string,
		position: PositionEx,
		rotation: PositionEx,
		scale: number,
		duration: number
	) {
		await this.loadPtfx(name);

		const particleEffect = mp.game.graphics.startParticleFxLoopedAtCoord(
			effect,
			position.x,
			position.y,
			position.z,
			rotation.x,
			rotation.y,
			rotation.z,
			scale,
			true,
			true,
			true,
			false
		);

		setTimeout(() => {
			mp.game.graphics.stopParticleFxLooped(particleEffect, false);
		}, duration);

		return particleEffect;
	}

	private async createFxOnBone(
		name: string,
		effect: string,
		offset: PositionEx,
		rotation: PositionEx,
		scale: number,
		entity: EntityMp,
		boneIndex: number,
		duration: number
	) {
		await this.loadPtfx(name);

		const particleEffect =
			mp.game.graphics.startParticleFxLoopedOnEntityBone(
				effect,
				entity.handle,
				offset.x,
				offset.y,
				offset.z,
				rotation.x,
				rotation.y,
				rotation.z,
				boneIndex,
				scale,
				false,
				false,
				false
			);

		setTimeout(() => {
			mp.game.graphics.stopParticleFxLooped(particleEffect, false);
		}, duration);

		return particleEffect;
	}

	private async loadPtfx(name: string) {
		if (!mp.game.streaming.hasNamedPtfxAssetLoaded(name)) {
			mp.game.streaming.requestNamedPtfxAsset(name);

			while (!mp.game.streaming.hasNamedPtfxAssetLoaded(name))
				await mp.game.waitAsync(0);
		}

		mp.game.graphics.setPtfxAssetNextCall(name);
	}
}

export default new Particles();
