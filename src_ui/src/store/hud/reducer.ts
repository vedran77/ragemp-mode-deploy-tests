import {
	HudState,
	HudActionTypes,
	SET_VISIBLE,
	SET_CAPTURE,
	SET_DEATH_LOG,
} from './types';
import './events';

const initialState: HudState = {
	visible: true,
	tasks: true,
	deathLog: [],
};

export default function appReducer(
	state = initialState,
	action: HudActionTypes
): HudState {
	switch (action.type) {
		case SET_VISIBLE:
			return {
				...state,
				visible: action.payload,
			};
		case SET_CAPTURE:
			return {
				...state,
				capture: action.payload.data,
				...((action.payload.show !== undefined && {
					showCapture: action.payload.show,
				}) ||
					{}),
			};

		case SET_DEATH_LOG:
			let deaths = state.deathLog.slice(0);

			if (!action.payload) {
				return {
					...state,
					deathLog: [],
				};
			}

			if (deaths.length + action.payload.length > 5) {
				deaths = deaths.slice(0, deaths.length - action.payload.length);
			}

			return {
				...state,
				deathLog: [...deaths, ...action.payload],
			};

		default:
			return state;
	}
}
