import rpc from 'rage-rpc';

class CasinoWheel {
	public wheel: ObjectMp;

	constructor() {
		this.wheel = mp.objects.new(
			mp.game.joaat('vw_prop_vw_luckywheel_02a'),
			new mp.Vector3(1111.052, 229.8579, -49.133)
		);

		mp.events.subscribe({
			'Casino:PrepareForSpin': this.prepare.bind(this),
		});

		mp.events.subscribeToDefault({
			'Casino:Spin': this.spin.bind(this),
		});
	}

	private getDictionary() {
		return mp.players.local.getModel() == 1885233650
			? 'ANIM_CASINO_A@AMB@CASINO@GAMES@LUCKY7WHEEL@MALE'
			: 'ANIM_CASINO_A@AMB@CASINO@GAMES@LUCKY7WHEEL@FEMALE';
	}

	public async spin(stopsAt: number, isOwner: boolean) {
		let spins = 320,
			maxSpeed = 2.25;
		const speed = maxSpeed / (spins * 2 + (stopsAt + this.wheel.getRotation(1).y / 18) * 16 + 1);
		mp.game.audio.playSoundFromCoord(
			1,
			'Spin_Start',
			1111.052,
			229.8579,
			-49.133,
			'dlc_vw_casino_lucky_wheel_sounds',
			true,
			0,
			false
		);

		while (true) {
			if (spins <= 0) {
				maxSpeed -= speed;
				this.wheel.setRotation(0, this.wheel.getRotation(1).y - maxSpeed, 0, 2, true);
				if (maxSpeed <= 0) {
					this.wheel.setRotation(0, Math.round(this.wheel.getRotation(1).y), 0, 2, true);
					mp.game.audio.playSoundFromCoord(
						1,
						'Win',
						1111.052,
						229.8579,
						-49.133,
						'dlc_vw_casino_lucky_wheel_sounds',
						true,
						0,
						false
					);

					if (isOwner) {
						rpc.callServer('Casino:WheelSpinFinish');
						mp.players.local.taskPlayAnim(
							this.getDictionary(),
							'Win_Big',
							4,
							-1000,
							-1,
							1048576,
							0,
							false,
							true,
							false
						);
						while (true) {
							if (
								mp.players.local.isPlayingAnim(this.getDictionary(), 'Win_Big', 3) &&
								mp.players.local.getAnimCurrentTime(this.getDictionary(), 'Win_Big') > 0.75
							) {
								mp.players.local.clearTasks();
								break;
							}
							await mp.game.waitAsync(0);
						}
					}
					break;
				}
			} else {
				spins--;
				this.wheel.setRotation(0, this.wheel.getRotation(1).y - maxSpeed, 0, 2, true);
			}
			await mp.game.waitAsync(5);
		}
	}

	public async prepare(stopsAt: number): Promise<void> {
		const dict = this.getDictionary();
		mp.game.streaming.requestAnimDict(dict);
		while (!mp.game.streaming.hasAnimDictLoaded(dict)) {
			await mp.game.waitAsync(0);
		}
		if (
			mp.players.local.getScriptTaskStatus(2106541073) != 1 &&
			mp.players.local.getScriptTaskStatus(2106541073) != 0
		) {
			const offset = mp.game.ped.getAnimInitialOffsetPosition(
				dict,
				'Enter_to_ArmRaisedIDLE',
				1111.052,
				229.8492,
				-50.6409,
				0,
				0,
				0,
				0,
				2
			);
			mp.players.local.taskGoStraightToCoord(offset.x, offset.y, offset.z, 1, 8000, 317, 0.001);
			while (
				!(
					mp.players.local.getScriptTaskStatus(2106541073) == 7 ||
					mp.players.local.isAtCoord(offset.x, offset.y, offset.z, 0.1, 0.0, 0.0, false, true, 0)
				)
			) {
				await mp.game.waitAsync(0);
			}
			mp.players.local.taskPlayAnim(dict, 'Enter_to_ArmRaisedIDLE', 4, -1000, -1, 1048576, 0, false, true, false);
			let isGoing: boolean;
			while (true) {
				if (
					mp.players.local.isPlayingAnim(dict, 'Enter_to_ArmRaisedIDLE', 3) &&
					mp.players.local.getAnimCurrentTime(dict, 'Enter_to_ArmRaisedIDLE') > 0.97
				) {
					mp.players.local.taskPlayAnim(
						dict,
						'ArmRaisedIDLE_to_SpinningIDLE_High',
						4,
						-1000,
						-1,
						1048576,
						0,
						false,
						true,
						false
					);
				}
				if (mp.players.local.isPlayingAnim(dict, 'ArmRaisedIDLE_to_SpinningIDLE_High', 3)) {
					if (
						!isGoing &&
						mp.players.local.getAnimCurrentTime(dict, 'ArmRaisedIDLE_to_SpinningIDLE_High') > 0.04
					) {
						isGoing = true;
						this.spin(stopsAt, true);
					}
					if (mp.players.local.getAnimCurrentTime(dict, 'ArmRaisedIDLE_to_SpinningIDLE_High') > 0.8) {
						mp.players.local.taskPlayAnim(
							dict,
							'SpinningIDLE_High',
							8.0,
							1.0,
							-1,
							1,
							1.0,
							false,
							false,
							false
						);
						break;
					}
				}
				await mp.game.waitAsync(0);
			}
		}
	}
}

export default new CasinoWheel();
