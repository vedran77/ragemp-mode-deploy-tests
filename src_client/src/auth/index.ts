import gangZones from 'factions/gang/zones';
import hud from 'basic/hud';
import serverMessages from 'basic/server-messages';
import character from 'player/character';

const player = mp.players.local;

type Character = {
	[name: string]: any;
};

class Auth {
	constructor() {
		mp.events.subscribe({
			'Auth-ShowMenu': this.showMenu,
			'Auth-SuccessLogin': this.onLogin,
			'Auth-SuccessRegister': this.onRegister.bind(this),
			'Auth-ShowCharacters': this.showCharacters.bind(this),
			'Auth-CharacterSelected': this.onCharacterSelected.bind(this),
		});
	}

	private showMenu() {
		mp.browsers.showPage('auth', { email: mp.storage.data.login });
		gangZones.load();
	}

	private onLogin(email: string) {
		mp.storage.update({ login: email });

		hud.updateOnline();

		if (player.getVariable('isNewbie')) {
			return mp.events.callServer('Character-ShowCreator');
		}
	}

	private onRegister(email: string) {
		mp.storage.update({ login: email });
	}

	private showCharacters(characters: Character[]) {
		mp.browsers.showPage(
			'choose-character',
			{
				characters,
			},
			true,
			true
		);
	}

	async onCharacterSelected(id: string, preview?: boolean) {
		await mp.events.callServer('Auth-LoadCharacter', [id, preview]);

		if (preview || id === 'new') return;

		mp.cameras.reset();
		mp.browsers.hidePage();
		character.reset();

		mp.browsers.showPage('daily');
		player.freezePosition(false);

		hud.setPlayerId();

		setInterval(() => mp.discord.update('Igra', 'na www.ghetto-rp.com'), 10000);
		mp.gui.chat.push(`Dobrodošli na !{95e800}Ghetto RolePlay !{ffffff}${player.name}`);

		serverMessages.sendRandomServerMessage();
	}
}

export default new Auth();
