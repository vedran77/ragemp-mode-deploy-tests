import inventory from 'basic/inventory/helper';
import equipment from 'player/equipment';
import weaponsData from 'data/weapons.json';
import './sync';

class Weapons {
	constructor() {
		mp.events.subscribeToDefault({
			'Weapons-SaveAmmo': this.saveAmmo.bind(this),
			'Weapons-Reload': this.reload.bind(this),
		});

		mp.events.subscribe({
			'Weapons-GetTotalAmmo': this.getTotalAmmoOfWeapon.bind(this),
		});
	}

	getTotalAmmoOfWeapon(player: Player, weapon: number) {
		const weaponName = weaponsData?.[weapon]?.HashKey;

		const ammoType = this.getAmmoOfWeapon(weaponName.toLowerCase().replace('weapon_', ''));
		const ammoCount = player.inventory
			.filter((invItem) => invItem.name === ammoType)
			.reduce((prev, curr) => {
				return prev + curr.amount;
			}, 0);

		return ammoCount - player.mp.weaponAmmo;
	}

	giveWeapon(player: Player, name: string) {
		const weapon = mp.joaat(`weapon_${name}`);

		player.mp.giveWeapon(weapon, 0);
		player.callEvent('Weapons-GiveWeapon', [weapon, 0]);
	}

	giveAmmo(player: Player, item: InventoryItem) {
		const weapon = equipment.getEquipment(player, 'hands');

		if (weapon && this.getAmmoOfWeapon(weapon.name) !== item.name) {
			return mp.events.reject('Vaše oružije ne koristi ovaj kalibar.');
		}

		this.setAmmo(player, item.amount);
	}

	removeWeapon(player: Player) {
		player.mp.removeAllWeapons();
		player.callEvent('Weapons-RemoveWeapon');
	}

	removeAmmo(player: Player) {
		this.setAmmo(player, 0);
	}

	private reload(player: Player) {
		const weapon = equipment.getEquipment(player, 'hands');

		if (!weapon) return;

		const clipSize = weaponsData?.[mp.joaat(`weapon_${weapon.name}`)]?.DefaultClipSize;

		const ammoType = this.getAmmoOfWeapon(weapon.name);

		const ammo = inventory.findItem(player.inventory, ammoType);
		if (!ammo) return;

		if (player.mp.weaponAmmo === clipSize) return;

		let ammoAmount = clipSize;
		if (ammo.amount < clipSize) {
			ammoAmount = ammo.amount;
		}

		this.setAmmo(player, ammoAmount);
	}

	private getAmmoOfWeapon(weapon: string) {
		return inventory.getItemData(weapon)?.ammo as string;
	}

	private setAmmo(player: Player, amount: number) {
		const weapon = equipment.getEquipment(player, 'hands');

		if (!weapon) return;

		player.mp.setWeaponAmmo(mp.joaat(`weapon_${weapon.name}`), 0);
		player.mp.giveWeapon(mp.joaat(`weapon_${weapon.name}`), amount);
		player.callEvent('Weapons-GiveAmmo', amount);
	}

	private saveAmmo(player: Player, amount: number) {
		const weapon = equipment.getEquipment(player, 'hands');

		if (!weapon) return;

		const ammoType = this.getAmmoOfWeapon(weapon.name);

		const invAmmo = inventory.findItem(player.inventory, ammoType);
		if (!invAmmo) return;

		invAmmo.amount -= amount;

		if (invAmmo.amount < 1) {
			inventory.removeItem(player.inventory, invAmmo);
		}
	}
}

export default new Weapons();
