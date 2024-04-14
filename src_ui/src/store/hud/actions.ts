import {
	SET_VISIBLE,
	SET_CAPTURE,
	Capture,
	HudActionTypes,
	SET_DEATH_LOG,
	DeathLog,
} from './types';

export function setVisible(status: boolean): HudActionTypes {
	return {
		type: SET_VISIBLE,
		payload: status,
	};
}

export function setCapture(data: Capture, show: boolean): HudActionTypes {
	return {
		type: SET_CAPTURE,
		payload: { data, show },
	};
}

export function setDeathLog(data: DeathLog[]): HudActionTypes {
	return {
		type: SET_DEATH_LOG,
		payload: data,
	};
}
