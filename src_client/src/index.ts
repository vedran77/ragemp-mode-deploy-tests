import './helpers';
import './basic/waypoint';
import './basic/location-area';
import './basic/weather';
import './basic/location';
import './basic/voice';
import './basic/doors';
import './basic/inventory';
import './basic/dialog';
import './basic/offer';
import './admin';
import './auth';
import './player';
import './vehicle';
import './property';
import './services';
import './weapons';
import './jobs';
import './games';
import './trading';
import './factions';

// CashRegister
mp.game.entity.createModelHide(0.0, 0.0, 0.0, 10000.0, mp.game.joaat('prop_till_01'), true);
// casino
mp.game.entity.createModelHide(
	1146.329,
	261.2543,
	-52.84094,
	30.0,
	mp.game.joaat('vw_prop_casino_3cardpoker_01'),
	true
);
mp.game.entity.createModelHide(
	1143.338,
	264.2453,
	-52.84094,
	30.0,
	mp.game.joaat('vw_prop_casino_3cardpoker_01'),
	true
);
mp.game.entity.createModelHide(1148.837, 269.747, -52.84095, 30.0, mp.game.joaat('vw_prop_casino_blckjack_01'), true);
mp.game.entity.createModelHide(1151.84, 266.747, -52.84095, 30.0, mp.game.joaat('vw_prop_casino_blckjack_01'), true);
mp.game.entity.createModelHide(1144.429, 247.3352, -52.041, 30.0, mp.game.joaat('vw_prop_casino_blckjack_01b'), true);
mp.game.entity.createModelHide(
	1148.74,
	251.6947,
	-52.04094,
	30.0,
	mp.game.joaat('vw_prop_casino_3cardpoker_01b'),
	true
);
mp.game.entity.createModelHide(
	1133.74,
	266.6947,
	-52.04094,
	30.0,
	mp.game.joaat('vw_prop_casino_3cardpoker_01b'),
	true
);
mp.game.entity.createModelHide(1129.406, 262.3578, -52.041, 30.0, mp.game.joaat('vw_prop_casino_blckjack_01b'), true);

mp.game.streaming.requestNamedPtfxAsset('scr_ornate_heist');

const interiorId = mp.game.interior.getInteriorAtCoords(311.2546, -592.4204, 42.32737);

const enableIpls = [
	'hei_dlc_windows_casino',
	'vw_casino_main',
	'vw_casino_garage',
	'vw_casino_carpark',
	'vw_casino_penthouse',
	'hei_dlc_casino_door',
	'vw_dlc_casino_door',
	'hei_dlc_casino_aircon',
];
const disableIpls = [
	'rc12b_fixed',
	'rc12b_destroyed',
	'rc12b_default',
	'rc12b_hospitalinterior_lod',
	'rc12b_hospitalinterior',
];

mp.game.streaming.requestIpl('gabz_pillbox_milo_');

disableIpls.forEach((ipl) => mp.game.streaming.isIplActive(ipl) && mp.game.streaming.removeIpl(ipl));

enableIpls.forEach((ipl) => !mp.game.streaming.isIplActive(ipl) && mp.game.streaming.requestIpl(ipl));

mp.game.interior.enableInteriorProp(interiorId, 'gabz_pillbox_milo_');
mp.game.interior.refreshInterior(interiorId);

mp.game.gxt.set('PM_PAUSE_HDR', 'Ghetto RolePlay');
mp.game.ui.setMinimapComponent(15, true, -1);
