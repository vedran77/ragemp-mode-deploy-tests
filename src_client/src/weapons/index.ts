import hud from 'basic/hud';
import binder from 'utils/binder';
import './firing-mode';

type Call = {
	position: Vector3Mp;
	time: number;
};

let countShoutAmmo = 0;
let lastShootingInfo: null | Call = null;
class Weapons {
	private weapon = 0;
	private ammo = 0;

	constructor() {
		this.subscribeToEvents();
	}

	get currentWeapon() {
		return this.weapon;
	}

	get currentAmmo() {
		return this.ammo;
	}

	private giveWeapon(hash: number, ammo: number) {
		if (this.weapon) return;

		this.weapon = hash;
		this.ammo = ammo;

		this.giveAmmo(this.ammo);
	}

	private giveAmmo(amount: number) {
		if (!this.weapon) return;

		this.ammo = amount;

		hud.showAmmo(amount);
	}

	private removeWeapon() {
		this.weapon = 0;
		this.ammo = 0;

		hud.showAmmo(-1);
	}

	private onShot() {
		if (this.isMelee(this.weapon)) return;

		mp.game.cam.shakeGameplayCam('SMALL_EXPLOSION_SHAKE', 0.01);

		this.ammo--;

		if (this.ammo <= 0) {
			this.ammo = 0;
			mp.players.local.clearTasks();
		}

		hud.showAmmo(this.ammo);

		countShoutAmmo++;

		this.triggerSaveAmmo();
		this.triggerCallout();
	}

	private triggerSaveAmmo() {
		if (!this.weapon || this.isMelee(this.weapon)) return;

		setTimeout(() => {
			mp.events.callRemote('Weapons-SaveAmmo', countShoutAmmo);
			countShoutAmmo = 0;
		}, 1000);
	}

	private triggerCallout() {
		const player = mp.players.local;

		if (['lspd', 'lssd'].includes(player.getVariable('faction')) && player.getVariable('factionWork')) return;

		const currentTime = Date.now();
		const currentPosition = player.position;

		if (
			!lastShootingInfo ||
			(currentTime - lastShootingInfo.time > 30000 &&
				lastShootingInfo?.position &&
				mp.game.system.vdist(
					currentPosition.x,
					currentPosition.y,
					currentPosition.z,
					lastShootingInfo.position.x,
					lastShootingInfo.position.y,
					lastShootingInfo.position.z
				) > 200)
		) {
			mp.events.callRemote(
				'PoliceCalls-CreateCallout',
				JSON.stringify({
					id: 's' + player.remoteId.toString(),
					message: 'Prijavljena je pucnjava',
					position: currentPosition,
				})
			);

			lastShootingInfo = { position: currentPosition, time: currentTime };
		}
	}

	private isMelee(weaponHash: number) {
		const group = mp.game.weapon.getWeapontypeGroup(weaponHash);

		return group === 2685387236 || weaponHash === 911657153;
	}

	private getClipSize(weapon: string | number) {
		const hash = typeof weapon === 'string' ? mp.game.joaat(weapon) : weapon;

		return mp.game1.weapon.getWeaponClipSize(hash);
	}

	private reloadWeapon() {
		const player = mp.players.local;

		if (!mp.browsers.hud || player.isCuffed() || player.isTypingInTextChat || mp.animations.isPlaying(player))
			return;

		const weapon = player.weapon;

		if (!weapon) return;

		mp.events.callRemote('Weapons-Reload');
	}

	private subscribeToEvents() {
		mp.events.subscribeToDefault({
			playerWeaponShot: this.onShot.bind(this),
		});

		mp.events.subscribe({
			'Weapons-GetClipSize': this.getClipSize,
			'Weapons-GiveWeapon': this.giveWeapon.bind(this),
			'Weapons-GiveAmmo': this.giveAmmo.bind(this),
			'Weapons-RemoveWeapon': this.removeWeapon.bind(this),
		});

		binder.bind('weapon_reload', 'R', this.reloadWeapon, null, true);

		mp.events.add(
			'outgoingDamage',
			(sourceEntity, targetEntity: PlayerMp, sourcePlayer, weapon, boneIndex: number, damage: number) => {
				if (targetEntity.type === 'player' && boneIndex !== 20) {
					const armor = targetEntity.getArmour();

					if (armor >= 0) {
						mp.events.callRemote('WeaponSync-ApplyDamage', targetEntity, damage);
					}
				}
			}
		);
	}
}

export default new Weapons();
