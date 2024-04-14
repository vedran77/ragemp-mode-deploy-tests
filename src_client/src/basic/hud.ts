import binder from 'utils/binder';

const player = mp.players.local;

class HUD {
	private isVisible = true;

	constructor() {
		mp.game.ui.setHudColour(143, 203, 54, 148, 255);
		mp.game.ui.setHudColour(144, 203, 54, 148, 255);
		mp.game.ui.setHudColour(145, 203, 54, 148, 255);

		binder.bind('noHUD', 'F5', this.toggle.bind(this));
		binder.bind('cursor', '`', () => this.setCursorVisible(!mp.gui.cursor.visible), null);

		mp.events.subscribeToDefault({ render: this.hideUnnecessaryElements });
		mp.events.subscribe({
			'HUD-GetBinds': this.getBinds,
			'HUD-GetMinimapAnchor': this.getMinimapAnchor,
			'HUD-ShowLevel': this.showLevelStats.bind(this),
			'HUD-ShowInteract': this.showInteract.bind(this),
		});

		setInterval(() => this.updateOnline(), 5000);

		this.biggerMap();
	}

	get visible() {
		return this.isVisible;
	}

	set visible(status: boolean) {
		this.isVisible = status;

		mp.game.ui.displayAreaName(status);
		mp.game.ui.displayRadar(status);
		mp.game.ui.displayHud(status);
		mp.gui.chat.show(status);

		mp.events.callBrowser('HUD-SetVisible', status, false);
	}

	showInteract(keyName?: string) {
		if (keyName) {
			mp.game.audio.playSoundFrontend(-1, 'Boss_Blipped', 'GTAO_Magnate_Hunt_Boss_SoundSet', true);
		}

		this.triggerEvent('HUD-ShowInteract', keyName);
	}

	async showAmmo(count: number) {
		const totalAmmo = await mp.events.callServer('Weapons-GetTotalAmmo', player.weapon);

		this.triggerEvent('HUD-SetAmmo', {
			count,
			weaponHash: player.weapon,
			totalAmmo: totalAmmo,
		});
	}

	setLocation(street: string, zone: string, greenZone: boolean) {
		this.triggerEvent('HUD-SetLocation', { street, zone, greenZone });
	}

	setMicStatus(status: boolean) {
		this.triggerEvent('HUD-SetMicStatus', status);
	}

	showOffer(seller: string, text: string) {
		this.triggerEvent('HUD-ShowOffer', { seller, text });
	}

	showLevelStats(level: number, experience: [number, number]) {
		this.triggerEvent('HUD-ShowLevel', { current: level, experience });
	}

	updateOnline() {
		mp.events.callBrowser('App-SetOnline', mp.players.length, false);
	}

	setPlayerId() {
		const id = mp.players.local.remoteId;

		mp.events.callBrowser('Player-SetId', [player.getVariable('uid'), id], false);
	}

	getMinimapAnchor() {
		const sfX = 1.0 / 20.0;
		const sfY = 1.0 / 20.0;
		const safeZone = mp.game.graphics.getSafeZoneSize();
		const aspectRatio = mp.game.graphics.getScreenAspectRatio(false);
		const resolution = mp.game.graphics.getScreenActiveResolution(0, 0);
		const scaleX = 1.0 / resolution.x;
		const scaleY = 1.0 / resolution.y;

		const minimap = {
			scaleX,
			scaleY,
			width: scaleX * (resolution.x / (4 * aspectRatio)),
			height: scaleY * (resolution.y / 5.674),
			topY: 0,
			rightX: 0,
			bottomY: 1.0 - scaleY * (resolution.y * (sfY * (Math.abs(safeZone - 1.0) * 10))),
			leftX: scaleX * (resolution.x * (sfX * (Math.abs(safeZone - 1.0) * 10))),
		};

		minimap.rightX = minimap.leftX + minimap.width;
		minimap.topY = minimap.bottomY - minimap.height;

		return minimap;
	}

	setCursorVisible(status: boolean, freeze?: boolean) {
		if (player.getVariable('isDying')) return;

		mp.gui.cursor.show(typeof freeze === 'undefined' ? status : freeze, status);
	}

	private getBinds() {
		return mp.storage.data.binds;
	}

	private toggle() {
		if (!mp.browsers.hud) return;
		this.visible = !this.visible;
	}

	private hideUnnecessaryElements() {
		mp.game.ui.displayAmmoThisFrame(false);
		mp.game.ui.displayAreaName(false);
		mp.game.ui.hideHudComponentThisFrame(6);
		mp.game.ui.hideHudComponentThisFrame(7);
		mp.game.ui.hideHudComponentThisFrame(8);
		mp.game.ui.hideHudComponentThisFrame(9);
		mp.game.ui.hideHudComponentThisFrame(13);
	}

	private triggerEvent(name: string, data: any) {
		if (!mp.browsers.hud) return;

		mp.events.callBrowser(name, data, false);
	}

	private biggerMap() {
		const bigmap = {
			status: 0,
			timer: null,
		};

		mp.game.ui.setRadarZoom(1.0);
		mp.game.ui.setRadarBigmapEnabled(false, false);

		mp.events.add('render', () => {
			mp.game.controls.disableControlAction(0, 48, true);
			if (mp.game.controls.isDisabledControlJustPressed(0, 48)) {
				this.triggerEvent('HUD-ShowLevel', {
					current: player.getVariable('level'),
					experience: player.getVariable('experiences'),
				});

				if (bigmap.status === 0) {
					mp.game.ui.setRadarZoom(0.0);
					bigmap.status = 1;

					bigmap.timer = setTimeout(() => {
						mp.game.ui.setRadarBigmapEnabled(false, true);
						mp.game.ui.setRadarZoom(1.0);

						bigmap.status = 0;
						bigmap.timer = null;
					}, 10000);
				} else if (bigmap.status === 1) {
					if (bigmap.timer != null) {
						clearTimeout(bigmap.timer);
						bigmap.timer = null;
					}

					mp.game.ui.setRadarBigmapEnabled(true, false);
					mp.game.ui.setRadarZoom(0.0);
					bigmap.status = 2;

					this.triggerEvent('HUD-MapResize', {
						...this.getMinimapAnchor(),
						status: 1.5,
					});

					bigmap.timer = setTimeout(() => {
						mp.game.ui.setRadarBigmapEnabled(false, true);
						mp.game.ui.setRadarZoom(1.0);

						bigmap.status = 0;
						bigmap.timer = null;

						this.triggerEvent('HUD-MapResize', {
							...this.getMinimapAnchor(),
							status: 1,
						});
					}, 10000);
				} else {
					if (bigmap.timer != null) {
						clearTimeout(bigmap.timer);
						bigmap.timer = null;
					}

					mp.game.ui.setRadarBigmapEnabled(false, false);
					mp.game.ui.setRadarZoom(1.0);
					bigmap.status = 0;

					this.triggerEvent('HUD-MapResize', {
						...this.getMinimapAnchor(),
						status: 1,
					});
				}
			}
		});
	}
}

export default new HUD();
