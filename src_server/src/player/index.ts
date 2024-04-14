import UserModel from 'models/User';
import CharModel from 'models/Character';
import WantedModel from 'models/Wanted';
import money from 'helpers/money';
import time from 'basic/time';
import tasks from 'awards/tasks';
import bonus from 'awards/bonus';
import vehicleCtrl from 'vehicle';
import house from 'house';
import business from 'business';
import factions from 'factions';
import hunger from './hunger';
import character from './character';
import spawn from './spawn';
import './events';
import './docs';

import level from '../player/level';

class PlayerController {
	async load(player: Player, user: UserModel) {
		const { mp } = player;
		const { character: data } = user as UserModel & { character: CharModel };

		const userLevel = level.getLevelFromExp(data.experience);
		const neededExp = level.getNeededExp(userLevel);
		const prevLevelExp = level.getNeededExp(userLevel - 1);

		mp.setVariables({
			uid: data.uid,
			adminLvl: user.adminLvl,
			level: userLevel,
			experiences: [data.experience - prevLevelExp, neededExp - prevLevelExp],

			...((data.cuffed && { cuffs: data.cuffed }) || {}),
		});

		mp.name = `${data.firstName}_${data.lastName}`;
		player.dead = data.health <= 0;
		mp.health = data.health > 0 ? data.health : 20;

		player.dbId = data._id.toString();
		player.account = user._id.toString();
		player.adminLvl = user.adminLvl;
		player.experience = data.experience;
		player.phone = data.phone;
		player.inventory = data.inventory;
		player.vehicleSlots = data.vehicleSlots;
		player.registerAt = data.createdAt;
		player.licenses = data.licenses;
		player.skills = data.skills;
		player.bankAccount = data.bankAccount;
		player.arrest = data.arrest;
		player.paydayTime = data.paydayTime;

		factions.loadForPlayer(player);

		time.setTimeOnClient(mp);
		money.updatePlayer(player, {
			...data.toObject().money,
			points: user.donate,
		});
		hunger.updateForPlayer(player, data.hunger);

		character.load(player, data.appearance as any);

		tasks.generate(player, data, user.loginAt);
		bonus.initPlayerBonus(player, data.bonusTime, user.loginAt);
		house.loadForPlayer(player);
		business.loadForPlayer(player);

		await vehicleCtrl.loadPlayerVehicles(player);

		const wanted = await WantedModel.findOne({ suspect: data._id });
		if (wanted) {
			player.callEvent('Player-SetWantedLevel', wanted.priority);
		}

		if (data.position) player.tp(data.position, 90, mp.id + 1);
		else spawn.toStart(player);
	}

	savePlayers(players: Player[]) {
		const operations = [];

		players.forEach((player) => {
			if (!mp.players.exists(player.mp)) return;

			if (player.dbId)
				operations.push({
					updateOne: {
						filter: { _id: player.dbId },
						update: {
							position: player.mp.position,
							paydayTime: player.paydayTime,
							bonusTime: player.bonusTime,
							experience: player.experience,
							arrest: player.arrest,
						},
					},
				});
		});

		if (operations.length) CharModel.bulkWrite(operations);
	}
}

export default new PlayerController();
