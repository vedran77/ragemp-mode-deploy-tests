// script constants
const localPlayer = mp.players.local;

const firingModes = {
	Auto: 0,
	Burst: 1,
	Single: 2,
	Safe: 3,
};

const firingModeNames = ['AUTO', 'BURST', 'SINGLE', 'SAFE'];

const ignoredWeaponGroups = [
	// weapons in these groups are completely ignored
	mp.game.joaat('GROUP_UNARMED'),
	mp.game.joaat('GROUP_MELEE'),
	mp.game.joaat('GROUP_FIREEXTINGUISHER'),
	mp.game.joaat('GROUP_PARACHUTE'),
	mp.game.joaat('GROUP_STUNGUN'),
	mp.game.joaat('GROUP_THROWN'),
	mp.game.joaat('GROUP_PETROLCAN'),
	mp.game.joaat('GROUP_DIGISCANNER'),
	mp.game.joaat('GROUP_HEAVY'),
];

const burstFireAllowedWeapons = [mp.game.joaat('WEAPON_APPISTOL')]; // if a weapon's group is already in burstFireAllowedGroups, don't put it here
const burstFireAllowedGroups = [mp.game.joaat('GROUP_SMG'), mp.game.joaat('GROUP_MG'), mp.game.joaat('GROUP_RIFLE')];

const singleFireBlacklist = [
	// weapons in here are not able to use single fire mode
	mp.game.joaat('WEAPON_STUNGUN'),
	mp.game.joaat('WEAPON_BEANBAG'),
	mp.game.joaat('WEAPON_FLAREGUN'),
	mp.game.joaat('WEAPON_MARKSMANPISTOL'),
	// mp.game.joaat('WEAPON_GLOCK20'),
	mp.game.joaat('WEAPON_REVOLVER'),
	mp.game.joaat('WEAPON_REVOLVER_MK2'),
	mp.game.joaat('WEAPON_DOUBLEACTION'),
	mp.game.joaat('WEAPON_PUMPSHOTGUN'),
	mp.game.joaat('WEAPON_PUMPSHOTGUN_MK2'),
	mp.game.joaat('WEAPON_SAWNOFFSHOTGUN'),
	mp.game.joaat('WEAPON_BULLPUPSHOTGUN'),
	mp.game.joaat('WEAPON_MUSKET'),
	mp.game.joaat('WEAPON_DBSHOTGUN'),
	mp.game.joaat('WEAPON_SNIPERRIFLE'),
	mp.game.joaat('WEAPON_HEAVYSNIPER'),
	mp.game.joaat('WEAPON_HEAVYSNIPER_MK2'),
];

// script functions
const isWeaponIgnored = (weaponHash: number) => {
	return ignoredWeaponGroups.indexOf(mp.game.weapon.getWeapontypeGroup(weaponHash)) > -1;
};

const canWeaponUseBurstFire = (weaponHash: number) => {
	return burstFireAllowedGroups.indexOf(mp.game.weapon.getWeapontypeGroup(weaponHash)) > -1
		? true
		: burstFireAllowedWeapons.indexOf(weaponHash) > -1;
};

const canWeaponUseSingleFire = (weaponHash: number) => {
	return singleFireBlacklist.indexOf(weaponHash) == -1;
};

const drawTextAligned = (text: string, drawX: number, drawY: number, font: number, color: number[], scale: number) => {
	mp.game.ui.setTextEntry('STRING');
	mp.game.ui.addTextComponentSubstringPlayerName(text);
	mp.game.ui.setTextFont(font);
	mp.game.ui.setTextScale(scale, scale);
	mp.game.ui.setTextColour(color[0], color[1], color[2], color[3]);
	mp.game.ui.setTextRightJustify(true);
	mp.game.ui.setTextWrap(0, drawX);
	mp.game.invoke('0x2513DFB0FB8400FE'); // SET_TEXT_OUTLINE
	mp.game.ui.drawText(drawX, drawY);
};

// script variables
let currentWeapon = localPlayer.weapon;
let ignoreCurrentWeapon = isWeaponIgnored(currentWeapon);
let weaponConfig = {};
let lastWeaponConfigUpdate = 0;

// these are for the current weapon
let curFiringMode = 0;
let curBurstShots = 0;

// load mp audio for the click sound
mp.game.audio.setAudioFlag('LoadMPData', true);

mp.events.add('render', () => {
	if (localPlayer.weapon != currentWeapon) {
		// playerWeaponChange clientside when...
		currentWeapon = localPlayer.weapon;
		ignoreCurrentWeapon = isWeaponIgnored(currentWeapon);

		curFiringMode = weaponConfig[currentWeapon] === undefined ? firingModes.Auto : weaponConfig[currentWeapon];
		curBurstShots = 0;
	}

	if (ignoreCurrentWeapon) return;

	if (curFiringMode != firingModes.Auto) {
		if (curFiringMode == firingModes.Burst) {
			// handle burst fire
			if (localPlayer.isShooting()) curBurstShots++;
			if (curBurstShots > 0 && curBurstShots < 3) mp.game.controls.setControlNormal(0, 24, 1.0);

			if (curBurstShots == 3) {
				mp.game.player.disableFiring(false);
				if (mp.game.controls.isDisabledControlJustReleased(0, 24)) curBurstShots = 0;
			}

			if (localPlayer.isReloading()) curBurstShots = 0;
		} else if (curFiringMode == firingModes.Single) {
			// handle single fire
			if (mp.game.controls.isDisabledControlPressed(0, 24)) mp.game.player.disableFiring(false);
		} else if (curFiringMode == firingModes.Safe) {
			// handle safe
			mp.game.player.disableFiring(false);
			if (mp.game.controls.isDisabledControlJustPressed(0, 24))
				mp.game.audio.playSoundFrontend(-1, 'Faster_Click', 'RESPAWN_ONLINE_SOUNDSET', true);
		}
	}

	if (mp.game.ui.isHudComponentActive(2) || Date.now() - lastWeaponConfigUpdate < 3000) {
		let safeZone = mp.game.graphics.getSafeZoneSize();
		let finalDrawX = 0.99;
		let finalDrawY = 0.275;

		drawTextAligned(firingModeNames[curFiringMode], finalDrawX, finalDrawY, 4, [240, 240, 240, 255], 0.26);
	}
});

// X - change firing mode
mp.keys.bind(0x58, false, () => {
	if (ignoreCurrentWeapon || localPlayer.isTypingInTextChat) return;

	let newFiringMode = curFiringMode + 1;
	if (newFiringMode > firingModes.Safe) newFiringMode = firingModes.Auto;

	if (newFiringMode == firingModes.Burst) {
		// switched to burst, check if weapon supports burst fire. if not, skip to safe
		if (!canWeaponUseBurstFire(currentWeapon))
			newFiringMode = canWeaponUseSingleFire(currentWeapon) ? firingModes.Single : firingModes.Safe;
	} else if (newFiringMode == firingModes.Single) {
		// switched to single, check if weapon supports single fire. if not, skip to safe
		if (!canWeaponUseSingleFire(currentWeapon)) newFiringMode = firingModes.Safe;
	}

	if (curFiringMode != newFiringMode) {
		curFiringMode = newFiringMode;
		curBurstShots = 0;
		lastWeaponConfigUpdate = Date.now();

		mp.game.audio.playSoundFrontend(-1, 'Faster_Click', 'RESPAWN_ONLINE_SOUNDSET', true);
		weaponConfig[currentWeapon] = curFiringMode;
	}
});
