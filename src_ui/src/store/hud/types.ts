export const SET_VISIBLE = 'SET_VISIBLE';
export const SET_CAPTURE = 'SET_CAPTURE';
export const SET_DEATH_LOG = 'SET_DEATH_LOG';

type CaptureTeam = {
	name: string;
	members: number;
};

export type Capture = {
	time: number;
	attacker: CaptureTeam;
	defender: CaptureTeam;
};

export type DeathLog = {
	target: string;
	killer: string;
	weapon: number | string;
};

type SetVisibleAction = {
	type: typeof SET_VISIBLE;
	payload: boolean;
};
type SetCaptureAction = {
	type: typeof SET_CAPTURE;
	payload: { data: Capture; show?: boolean };
};
type SetDeathLogAction = {
	type: typeof SET_DEATH_LOG;
	payload: DeathLog[];
};

export type HudActionTypes =
	| SetVisibleAction
	| SetCaptureAction
	| SetDeathLogAction;

export interface HudState {
	visible: boolean;
	tasks: boolean;
	capture?: Capture;
	showCapture?: boolean;
	deathLog: DeathLog[];
	position?: {
		x: number;
		y: number;
	};
}
