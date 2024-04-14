import animations from 'helpers/animations';
import notifications from 'helpers/notifications';

type ShopCase = {
	pos: PositionEx | Vector3Mp;
	prop: string;
	prop1: string;
	broken: boolean;
};

let isPlayerInArea = false;
let isAlreadyEnteredArea = false;
let isAlreadyRobbing = false;
let allowedWeapons:
	| {
			name: string;
			chance: number;
	  }[]
	| null = null;

class JewelryShop {
	private cases: Map<number, ShopCase> = new Map();

	constructor() {
		mp.events.subscribeToDefault({
			render: this.render.bind(this),
		});

		mp.events.subscribe({
			'JewelryShop-SetCase': this.setCase.bind(this),
		});

		this.load();
	}

	private async render() {
		const position = mp.players.local.position;

		if (
			mp.game.gameplay.getDistanceBetweenCoords(
				position.x,
				position.y,
				position.z,
				-622.2496,
				-230.8,
				38.05705,
				true
			) < 20.0
		) {
			if (!isPlayerInArea) {
				isPlayerInArea = true;
			}
		} else {
			if (isPlayerInArea) {
				Array.from(this.cases.values()).forEach((shopCaseInArea) => {
					mp.game.entity.removeModelSwap(
						shopCaseInArea.pos.x,
						shopCaseInArea.pos.y,
						shopCaseInArea.pos.z,
						0.1,
						mp.game.joaat(shopCaseInArea.prop1),
						mp.game.joaat(shopCaseInArea.prop),
						false
					);
				});

				this.runAlarmSound(false);
				isPlayerInArea = false;
				isAlreadyEnteredArea = false;
			}
		}

		if (!isPlayerInArea) return;

		if (!isAlreadyEnteredArea) {
			isAlreadyEnteredArea = true;

			if (Array.from(this.cases.values()).some((c) => c.broken)) {
				this.runAlarmSound(true);
			}

			Array.from(this.cases.values()).forEach((shopCaseInArea) => {
				if (shopCaseInArea.broken) {
					mp.game.entity.createModelSwap(
						shopCaseInArea.pos.x,
						shopCaseInArea.pos.y,
						shopCaseInArea.pos.z,
						0.1,
						mp.game.joaat(shopCaseInArea.prop1),
						mp.game.joaat(shopCaseInArea.prop),
						false
					);
				}
			});
		}

		const shopCaseIndex = Array.from(this.cases.values()).findIndex(
			(c) =>
				mp.game.gameplay.getDistanceBetweenCoords(
					position.x,
					position.y,
					position.z,
					c.pos.x,
					c.pos.y,
					c.pos.z,
					true
				) < 1 && !c.broken
		);
		const shopCase = this.cases.get(shopCaseIndex);

		if (shopCase && !shopCase.broken && !animations.isPlaying() && mp.players.local.weapon !== 2725352035) {
			mp.game.graphics.drawText(
				'Pretisni ~g~E~w~ da polomiš',
				[shopCase.pos.x, shopCase.pos.y, shopCase.pos.z + 0.5],
				{
					font: 4,
					color: [255, 255, 255, 215],
					scale: [0.3, 0.3],
					outline: true,
					centre: true,
				}
			);

			if (
				mp.game.controls.isControlJustPressed(0, 38) &&
				!mp.players.local.isWalking() &&
				!mp.players.local.isRunning() &&
				!mp.players.local.isSprinting() &&
				!isAlreadyRobbing
			) {
				const robChance = await this.checkChance();
				const canRob = await mp.events.callServer('Rob:PlayerBag', 'jewelry');

				if (canRob === null) return;

				isAlreadyRobbing = true;

				mp.players.local.taskTurnToFaceCoord(shopCase.pos.x, shopCase.pos.y, shopCase.pos.z, 1200);

				await mp.game.waitAsync(1200);

				animations.play(
					mp.players.local,
					shopCase?.prop?.includes('cab4') ? 'smash_case_jewlery_a' : 'smash_case_jewlery_b'
				);

				await mp.game.waitAsync(700);

				if (!robChance || !canRob) {
					mp.game.audio.playSoundFromCoord(
						-1,
						'Drill_Pin_Break',
						shopCase.pos.x,
						shopCase.pos.y,
						shopCase.pos.z,
						'DLC_HEIST_FLEECA_SOUNDSET',
						true,
						0,
						false
					);

					animations.stop(
						mp.players.local,
						shopCase?.prop?.includes('cab4') ? 'smash_case_jewlery_a' : 'smash_case_jewlery_b'
					);

					notifications.show(
						'info',
						!canRob ? 'Torba ti je već puna!' : 'Nisi uspeo da polomiš vitrinu, probaj ponovo',
						true
					);

					await mp.game.waitAsync(500);

					isAlreadyRobbing = false;

					return;
				}

				await mp.events.callServer('JewelryShop-SetCase', [shopCaseIndex, true]);
				mp.game.audio.playSoundFromCoord(
					-1,
					'Glass_Smash',
					shopCase.pos.x,
					shopCase.pos.y,
					shopCase.pos.z,
					'',
					true,
					0,
					false
				);

				mp.game.entity.createModelSwap(
					shopCase.pos.x,
					shopCase.pos.y,
					shopCase.pos.z,
					0.1,
					mp.game.joaat(shopCase.prop1),
					mp.game.joaat(shopCase.prop),
					false
				);

				await mp.game.waitAsync(shopCase?.prop?.includes('cab4') ? 2000 : 2500);

				animations.stop(
					mp.players.local,
					shopCase?.prop?.includes('cab4') ? 'smash_case_jewlery_a' : 'smash_case_jewlery_b'
				);

				await mp.events.callServer('JewelryShop-Award', [shopCaseIndex, robChance]);
				isAlreadyRobbing = false;
			}
		}
	}

	private async load() {
		const { cases, allowedWeapons: allAllowedWeapons } = await mp.events.callServer('JewelryShop-Load');

		allowedWeapons = allAllowedWeapons;

		cases.forEach((c: ShopCase, index: number) => {
			this.cases.set(index, c);
		});
	}

	private async checkChance() {
		if (!allowedWeapons) return;

		const random = Math.random() * 50;
		const weapon = allowedWeapons.find((w) => mp.game.joaat(w.name) === mp.players.local.weapon);

		if (!weapon) return;

		return random <= weapon.chance;
	}

	private setCase(caseIndex: number, broken = false) {
		const shopCase = this.cases.get(caseIndex);

		if (broken) {
			mp.game.entity.createModelSwap(
				shopCase.pos.x,
				shopCase.pos.y,
				shopCase.pos.z,
				0.1,
				mp.game.joaat(shopCase.prop1),
				mp.game.joaat(shopCase.prop),
				false
			);
			this.runAlarmSound(true);
		}

		shopCase.broken = broken;
		this.cases.set(caseIndex, shopCase);
	}

	private runAlarmSound(p2: boolean) {
		mp.game.audio.startAlarm('JEWEL_STORE_HEIST_ALARMS', p2);
	}
}

export default new JewelryShop();
