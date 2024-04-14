import Natives from 'data/natives.json';
import { banks } from './data';
import animations from 'helpers/animations';

import FleecaBanks from './banks';
import './thermal-charge';
import notifications from 'helpers/notifications';

const localPlayer = mp.players.local;

const animDict = 'anim@heists@ornate_bank@grab_cash';
let isAlreadyRobbing = false;

class FleecaBankRobbery {
	private fleecaInstance = FleecaBanks;

	constructor() {
		mp.events.subscribe({
			'FleecaBank-PlayLootTask': this.playTask.bind(this),
		});

		mp.events.subscribeToDefault({
			render: this.onRender.bind(this),
		});
	}

	private async playTask(player: PlayerMp, entityLooting: number) {
		if (player.type !== 'player' && localPlayer.handle === player.handle) return;

		if (entityLooting !== -1 && entityLooting !== null) {
			mp.animations.play(player, 'grab_cash_bank_robbery');
		}
	}

	private loadDicts() {
		mp.game.streaming.requestAnimDict(animDict);
		mp.game.streaming.requestModel(mp.game.joaat('hei_p_m_bag_var22_arm_s'));

		while (
			!mp.game.streaming.hasAnimDictLoaded(animDict) ||
			!mp.game.streaming.hasModelLoaded(mp.game.joaat('hei_p_m_bag_var22_arm_s'))
		) {
			mp.game.wait(0);
		}
	}

	private async cashAppear(player: PlayerMp) {
		const cash = await mp.objects.create(mp.game.joaat('hei_prop_heist_cash_pile'), player.position, {});

		cash.freezePosition(true);
		cash.setCollision(false, true);
		cash.setInvincible(true);
		cash.setNoCollision(player.handle, false);
		cash.setVisible(false, false);

		cash.attachTo(player.handle, player.getBoneIndex(60309), 0, 0, 0, 0, 0, 0, false, false, false, false, 0, true);

		const gameTimer = mp.game.invoke(Natives.GET_GAME_TIMER);

		while (mp.game.invoke(Natives.GET_GAME_TIMER) - gameTimer < 48000) {
			await mp.game.waitAsync(1);

			mp.game.controls.disableControlAction(0, 73, true);

			if (player.hasAnimEventFired(mp.game.joaat('CASH_APPEAR'))) {
				if (!cash.isVisible()) cash.setVisible(true, false);
			}

			if (player.hasAnimEventFired(mp.game.joaat('RELEASE_CASH_DESTROY'))) {
				cash.setVisible(false, false);
			}
		}

		cash.destroy();
	}

	private async scenes(player: PlayerMp, trolley: ObjectMp) {
		this.loadDicts();

		const animations = [
			['intro', 'bag_intro'],
			['grab', 'bag_grab', 'cart_cash_dissapear'],
			['exit', 'bag_exit'],
		];

		const playerBag = await mp.objects.create(mp.game.joaat('hei_p_m_bag_var22_arm_s'), player.position, {});

		player.setComponentVariation(5, 0, 0, 0);
		player.freezePosition(true);

		playerBag.setCollision(false, true);

		const scenes = animations.map((animation, index) => {
			return async () => {
				const scene = mp.game.ped.createSynchronizedScene(
					trolley.position.x,
					trolley.position.y,
					trolley.position.z,
					0,
					0,
					trolley.getHeading(),
					2
				);

				player.taskSynchronizedScene(scene, animDict, animation[0], 1.5, -4.0, 1, 16, 1148846080, 0);

				playerBag.playSynchronizedAnim(scene, animation[1], animDict, 4.0, -8.0, 1, 0x447a0000);

				if (index === 1) {
					trolley.playSynchronizedAnim(scene, animation[2], animDict, 1.0, -1.0, 1, 1148846080);
				}
			};
		});

		await scenes[0]();
		await mp.game.waitAsync(1750);
		this.cashAppear(player);
		await scenes[1]();
		await mp.game.waitAsync(48000);
		await scenes[2]();
		await mp.game.waitAsync(2000);

		mp.objects.new(
			mp.game.joaat('hei_prop_hei_cash_trolly_03'),
			new mp.Vector3(trolley.position.x, trolley.position.y, trolley.position.z),
			{
				rotation: trolley.rotation,
			}
		);

		trolley.destroy();
		playerBag.destroy();

		player.freezePosition(false);
		player.clearTasks();
		player.setComponentVariation(5, 81, 0, 0);

		await mp.events.callServer('FleecaBank-UpdateUser', [null, 'loot']);
	}

	private async onRender() {
		const position = mp.players.local.position;
		const bankNearByIndex = banks.findIndex((bank) =>
			bank.loots.some(
				(loot) =>
					mp.game.gameplay.getDistanceBetweenCoords(
						position.x,
						position.y,
						position.z,
						loot.x,
						loot.y,
						loot.z,
						true
					) < 20
			)
		);

		if (bankNearByIndex < 0) return;

		const bankNearBy = banks[bankNearByIndex];

		if (!bankNearBy) return;

		this.fleecaInstance.checkDoors(bankNearByIndex);

		const [lootObjectId, lootNearBy] = this.fleecaInstance.getLootNearBy();
		const isAnyoneLooting = mp.players.toArray().some((player) => {
			return player.getVariable('bank-rob-loot') == lootNearBy?.id;
		});

		if (lootNearBy && lootObjectId && !isAlreadyRobbing && !isAnyoneLooting) {
			mp.game.graphics.drawText(
				'Pretisni ~g~E~w~ da pokupiš novac',
				[lootNearBy.position.x, lootNearBy.position.y, lootNearBy.position.z + 0.5],
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
				!mp.players.local.isSprinting()
			) {
				const canRob = await mp.events.callServer('Rob:PlayerBag', 'money');

				if (!canRob === null) return;
				else if (!canRob) {
					notifications.show('info', 'Torba ti je već puna!', true);
					return;
				}

				isAlreadyRobbing = true;
				await mp.events.callServer('FleecaBank-UpdateUser', [lootNearBy.id, 'loot']);

				await this.scenes(localPlayer, lootNearBy);

				// Find the loot index & award the player
				const lootIndex = bankNearBy.loots.findIndex(
					(loot) =>
						loot.x === lootNearBy.position.x &&
						loot.y === lootNearBy.position.y &&
						loot.z === lootNearBy.position.z
				);
				await mp.events.callServer('FleecaBank-Award', [bankNearByIndex, lootIndex]);

				isAlreadyRobbing = false;
			}
		}
	}
}

export default new FleecaBankRobbery();
