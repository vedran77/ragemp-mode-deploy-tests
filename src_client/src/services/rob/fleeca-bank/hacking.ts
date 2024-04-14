import { banks } from './data';
import FleecaBanks from './banks';
import { xyInFrontOfPos } from 'utils/vector';

const localPlayer = mp.players.local;

let isHacking = false;

class FleecaBankHacking {
	private fleecaInstance = FleecaBanks;

	constructor() {
		mp.events.subscribe({
			'FleecaBank-StartHacking': this.startHacking.bind(this),
		});
	}

	private async loadDicts() {
		mp.game.streaming.requestAnimDict('anim@heists@ornate_bank@hack_heels');
		mp.game.streaming.requestModel(
			mp.game.joaat('hei_p_m_bag_var22_arm_s')
		);
		mp.game.streaming.requestNamedPtfxAsset('scr_ornate_heist');

		while (
			!mp.game.streaming.hasAnimDictLoaded(
				'anim@heists@ornate_bank@hack_heels'
			) &&
			!mp.game.streaming.hasModelLoaded(
				mp.game.joaat('hei_p_m_bag_var22_arm_s')
			) &&
			!mp.game.streaming.hasNamedPtfxAssetLoaded('scr_ornate_heist')
		) {
			await mp.game.waitAsync(0);
		}
	}

	private async scene(
		player: PlayerMp,
		safeDoor: {
			x: number;
			y: number;
			z: number;
			rot: number;
		}
	) {
		await this.loadDicts();

		player.setComponentVariation(5, 0, 0, 0);
		player.freezePosition(true);

		const playerBag = await mp.objects.create(
			mp.game.joaat('hei_p_m_bag_var22_arm_s'),
			player.position,
			{}
		);

		playerBag.setCollision(false, true);

		const playerPosition = xyInFrontOfPos(
			player.position,
			safeDoor.rot,
			0.9
		);

		const scene = mp.game.ped.createSynchronizedScene(
			playerPosition.x,
			playerPosition.y,
			playerPosition.z,
			0,
			0,
			safeDoor.rot,
			2
		);

		player.taskSynchronizedScene(
			scene,
			'anim@heists@ornate_bank@hack_heels',
			'thermal_charge',
			1.5,
			-4.0,
			1,
			16,
			1148846080,
			0
		);

		playerBag.playSynchronizedAnim(
			scene,
			'hack_laptop_loop',
			'anim@heists@ornate_bank@hack_heels',
			1,
			-1,
			1,
			0x447a0000
		);

		await mp.game.waitAsync(1500);

		const laptop = await mp.objects.create(
			mp.game.joaat('xm_prop_x17_laptop_lester_01'),
			player.position,
			{}
		);
		laptop.setCollision(false, true);
		laptop.attachTo(
			player.handle,
			player.getBoneIndex(28422),
			0,
			0,
			0,
			0,
			0,
			0,
			true,
			true,
			false,
			true,
			1,
			true
		);

		await mp.game.waitAsync(4000);
		laptop.detach(true, true);
		laptop.freezePosition(true);
		player.freezePosition(false);

		await mp.game.waitAsync(20000);

		playerBag.destroy();
		laptop.destroy();
	}

	private async startHacking(index: number) {
		const bank = banks[index];

		if (!bank && isHacking) {
			return;
		}

		if (
			mp.players.local.isWalking() &&
			mp.players.local.isRunning() &&
			mp.players.local.isSprinting()
		)
			return;

		isHacking = true;

		await this.scene(localPlayer, bank.safe);

		localPlayer.clearTasks();
		localPlayer.setComponentVariation(5, 81, 0, 0);

		// await this.fleecaInstance.updateCellStatus(index, false);

		isHacking = false;
	}
}

export default new FleecaBankHacking();
