class Particles {
	constructor() {
		mp.events.subscribe({
			'Particles-Create': this.create.bind(this),
			'Particles-CreateOnBone': this.createOnBone.bind(this),
		});
	}

	create(
		player: Player,
		name: string,
		effect: string,
		position: PositionEx,
		rotation: PositionEx,
		scale: number,
		duration: number
	) {
		mp.players.callInStream(player.mp.position, 'Particles-Create', [
			name,
			effect,
			position,
			rotation,
			scale,
			duration,
		]);
	}

	createOnBone(
		player: Player,
		name: string,
		effect: string,
		offset: PositionEx,
		rotation: PositionEx,
		scale: number,
		entity: EntityMp,
		boneIndex: number,
		duration: number
	) {
		mp.players.callInStream(entity.position, 'Particles-CreateOnBone', [
			name,
			effect,
			offset,
			rotation,
			scale,
			entity,
			boneIndex,
			duration,
		]);
	}
}

export default new Particles();
