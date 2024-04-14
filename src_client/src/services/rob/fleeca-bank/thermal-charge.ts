import { banks } from './data';
import FleecaBanks from './banks';
import { xyInFrontOfPos } from 'utils/vector';

const localPlayer = mp.players.local;

let isPlantingBomb = false;

class FleecaBankThermal {
	private fleecaInstance = FleecaBanks;

	constructor() {
		mp.events.subscribe({
			'FleecaBank-PlantBomb': this.plantBomb.bind(this),
			'FleecaBank-PlayPlantTask': this.playTask.bind(this),
		});
	}

	private playTask(player: PlayerMp, bankIndex: number, cellIndex: number) {
		if (player.type !== 'player' && player.handle === localPlayer.handle) return;

		if (banks[bankIndex] && banks[bankIndex].cells[cellIndex]) {
			this.scene(player, bankIndex, cellIndex);
		}
	}

	private async loadDicts() {
		mp.game.streaming.requestAnimDict('anim@heists@ornate_bank@thermal_charge');
		mp.game.streaming.requestModel(mp.game.joaat('hei_p_m_bag_var22_arm_s'));
		mp.game.streaming.requestNamedPtfxAsset('scr_ornate_heist');

		while (
			!mp.game.streaming.hasAnimDictLoaded('anim@heists@ornate_bank@thermal_charge') &&
			!mp.game.streaming.hasModelLoaded(mp.game.joaat('hei_p_m_bag_var22_arm_s')) &&
			!mp.game.streaming.hasNamedPtfxAssetLoaded('scr_ornate_heist')
		) {
			await mp.game.waitAsync(0);
		}
	}

	private async scene(player: PlayerMp, index: number, cellIndex: number) {
		await this.loadDicts();

		const cellDoor = banks[index].cells[cellIndex];

		player.setComponentVariation(5, 0, 0, 0);
		player.freezePosition(true);
		player.taskTurnToFaceCoord(cellDoor.x, cellDoor.y, cellDoor.z, 1200);

		await mp.game.waitAsync(1200);

		const playerBag = await mp.objects.create(mp.game.joaat('hei_p_m_bag_var22_arm_s'), player.position, {});

		playerBag.setCollision(false, true);

		const playerPosition = xyInFrontOfPos(new mp.Vector3(cellDoor.x, cellDoor.y, cellDoor.z), cellDoor.rot, 0.55);

		// const scene = mp.game1.ped.createSynchronizedScene(
		// 	playerPosition.x,
		// 	playerPosition.y,
		// 	playerPosition.z,
		// 	0,
		// 	0,
		// 	cellDoor.rot,
		// 	2
		// );

		// player.taskSynchronizedScene(
		// 	scene,
		// 	'anim@heists@ornate_bank@thermal_charge',
		// 	'thermal_charge',
		// 	1.5,
		// 	-4.0,
		// 	1,
		// 	16,
		// 	1148846080,
		// 	0
		// );

		// playerBag.playSynchronizedAnim(
		// 	scene,
		// 	'bag_thermal_charge',
		// 	'anim@heists@ornate_bank@thermal_charge',
		// 	1,
		// 	-1,
		// 	1,
		// 	0x447a0000
		// );

		playerBag.attachTo(
			player.handle,
			player.getBoneIndex(23553),
			-0.01,
			-0.01,
			-0.01,
			0.0,
			90.0,
			180.0,
			true,
			false,
			true,
			true,
			1,
			true
		);

		player.taskPlayAnim(
			'anim@heists@ornate_bank@thermal_charge',
			'thermal_charge',
			1.5,
			-4.0,
			-1,
			0,
			0,
			false,
			false,
			false
		);

		playerBag.playAnim('bag_thermal_charge', 'anim@heists@ornate_bank@thermal_charge', 1.5, true, true, true, 1, 1);

		await mp.game.waitAsync(1500);

		const bomb = await mp.objects.create(mp.game.joaat('hei_prop_heist_thermite'), player.position, {});
		bomb.setCollision(false, true);
		bomb.attachTo(player.handle, player.getBoneIndex(28422), 0, 0, 0, 0, 0, 90.0, true, true, false, true, 1, true);

		await mp.game.waitAsync(4000);
		bomb.detach(true, true);
		bomb.freezePosition(true);

		await mp.game.waitAsync(1000);

		await mp.events.callServer('Particles-CreateOnBone', [
			'scr_ornate_heist',
			'scr_heist_ornate_thermal_burn',
			{ x: 0, y: 0.3, z: 0 },
			{ x: 0, y: 0, z: 0 },
			0.3,
			{
				...bomb,
				position: bomb.position,
			},
			0,
			20000,
		]);

		player.taskPlayAnim(
			'anim@heists@ornate_bank@thermal_charge',
			'cover_eyes_loop',
			1.5,
			-4.0,
			-1,
			1,
			0,
			false,
			false,
			false
		);

		await mp.game.waitAsync(20000);

		player.freezePosition(false);

		playerBag.destroy();
		bomb.destroy();

		localPlayer.clearTasks();
		localPlayer.setComponentVariation(5, 81, 0, 0);

		await this.fleecaInstance.updateCellStatus(index, cellIndex, true);
		await mp.events.callServer('FleecaBank-UpdateUser', [[null, null], 'bomb']);
	}

	private async plantBomb(index: number) {
		const bank = banks[index];

		if (!bank && isPlantingBomb) {
			return;
		}

		if (localPlayer.isWalking() && localPlayer.isRunning() && localPlayer.isSprinting()) return;

		const cellIndex = bank.cells.findIndex(
			(cell) =>
				mp.game.gameplay.getDistanceBetweenCoords(
					localPlayer.position.x,
					localPlayer.position.y,
					localPlayer.position.z,
					cell.x,
					cell.y,
					cell.z,
					true
				) < 1.5
		);

		const isAnyonePlanting = mp.players.toArray().some((player) => {
			return player.getVariable('bank-rob-bomb') == cellIndex;
		});

		if (cellIndex === -1 || isAnyonePlanting) return;

		isPlantingBomb = true;
		await mp.events.callServer('FleecaBank-UpdateUser', [[index, cellIndex], 'bomb']);

		await this.scene(localPlayer, index, cellIndex);

		isPlantingBomb = false;
	}
}

export default new FleecaBankThermal();
