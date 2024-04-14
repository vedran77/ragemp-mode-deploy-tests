import { compare } from 'utils/encryption';
import UserModel from 'models/User';
import CharModel from 'models/Character';
import hud from 'helpers/hud';
import players from 'helpers/players';
import ban from 'admin/ban';
import playerCtrl from 'player';
import token from './token';
import character from 'player/character';
import level from 'player/level';
import { components } from 'player/clothes';

const normalizeCharacterData = (character: CharModel) => {
	const currentLevel = level.getLevelFromExp(character.experience);
	const neededExp = level.getNeededExp(currentLevel);
	const prevLevelExp = level.getNeededExp(currentLevel - 1);

	return {
		id: character?._id,
		gender: character?.appearance?.gender,
		arrest: character?.arrest,
		experience: character?.experience,
		level: level.getLevelFromExp(character.experience),
		experiences: [character.experience - prevLevelExp, neededExp - prevLevelExp],
		firstName: character?.firstName,
		lastName: character?.lastName,
		money: character?.money,
		playedTime: character?.playedTime,
		ban: character?.ban,
	};
};

class Login {
	constructor() {
		mp.events.subscribe(
			{
				'Auth-SignIn': this.signIn.bind(this),
				'Auth-SignInWithCode': this.signInWithCode.bind(this),
				'Auth-LoadCharacter': this.loadCharacter.bind(this),
			},
			false
		);

		mp.events.subscribeToDefault(
			{
				playerReady: (player: Player) => {
					player.callEvent('Auth-ShowMenu');
				},
			},
			false
		);
	}

	private isRecognizedDevice(player: PlayerMp, serial: string, social: string) {
		return player.socialClub === social && player.serial === serial;
	}

	private async signIn(player: Player, email: string, password: string) {
		const user = await UserModel.findOne({ email }).populate('characters');
		const error = await this.checkData(user, password);

		if (error) return Promise.reject(error);
		// if (mp.players.getByDbId(user.character)) return;

		if (ban.isValid(user)) {
			hud.showNotification(
				player,
				'error',
				`Banovani ste zbog: ${user.ban.reason}. Traje do: ${ban.getExpiresDate(user.ban)}.`,
				true
			);
			throw new SilentError('user is blocked');
		}

		if (!this.isRecognizedDevice(player.mp, user.serial, user.socialName)) {
			await token.create('login', email);
			return Promise.reject({ field: 'email', confirm: true });
		}

		player.account = user._id.toString();
		const { characters } = user as typeof user & { characters: CharModel[] };
		if (characters.length === 0) {
			player.mp.setOwnVariable('isNewbie', true);
			return;
		}

		player.callEvent('Auth-ShowCharacters', [(characters as CharModel[])?.map(normalizeCharacterData)]);

		// await this.loadAccount(player, user);
	}

	private async signInWithCode(player: Player, email: string, code: string) {
		const user = await UserModel.findOne({ email }).populate('characters');
		const isValidCode = await token.isValid(email, 'login', code);

		if (!user || !isValidCode) throw new SilentError('auth token is invalid');

		user.serial = player.mp.serial;
		user.socialName = player.mp.socialClub;

		player.account = user._id.toString();
		const { characters } = user as typeof user & { characters: CharModel[] };
		if (characters.length === 0) {
			player.mp.setOwnVariable('isNewbie', true);
			return;
		}

		player.callEvent('Auth-ShowCharacters', [(characters as CharModel[])?.map(normalizeCharacterData)]);

		// await this.loadAccount(player, user);
	}

	private async checkData(user: UserModel, password: string) {
		if (!user)
			return {
				field: 'email',
				message: 'Account nije pronađen sa ovim email-om',
			};

		const isCorrectPass = await compare(password, user.password);

		if (!isCorrectPass || mp.players.getByDbId(user._id)) {
			return { field: 'password', message: 'Pogrešna lozinka' };
		}
	}

	private async loadCharacter(player: Player, id: string, preview?: boolean) {
		if (id === 'new') {
			player.mp.name = `User_${player.mp.id}`;
			players.authorize(player);

			// reset player appearance
			player.inventory = [];
			character.reset(player);

			character.showCreator(player);
			return;
		}

		const characterData = await CharModel.findById(id);

		if (!characterData) return Promise.reject({ message: 'Karakter ne postoji' });

		const user = (await UserModel.findOne({
			characters: { $in: [id] },
		})) as UserModel & { character?: CharModel };

		if (!user)
			return Promise.reject({ message: 'Karakter nije dodeljen korisniku, proverite sa administracijom!' });

		user.character = characterData;

		if (preview) {
			player.inventory = characterData.inventory.filter((item) =>
				Object.keys(components).includes(item?.data?.slot)
			);

			character.load(player, characterData.appearance as any);
			character.showCreator(player, true);
			return;
		}

		player.equipment = null;
		await this.loadAccount(player, user);
	}

	async loadAccount(player: Player, user: UserModel & { character?: CharModel }) {
		await playerCtrl.load(player, user);

		user.loginAt = new Date().toISOString();
		if (!user.ip.includes(player.mp.ip)) user.ip.push(player.mp.ip);
		await user.save();
		await (user.character as any).save();

		players.authorize(player);
	}
}

const login = new Login();
