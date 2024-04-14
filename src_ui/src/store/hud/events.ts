import rpc from 'utils/rpc';
import { setVisible, setCapture, setDeathLog } from './actions';
import { updateState } from '../index';

rpc.register('HUD-SetVisible', (state) => updateState(setVisible(state)));
rpc.register('HUD-UpdateDeathLog', (data) => updateState(setDeathLog(data)));
rpc.register('HUD-SetCapture', (data, show) =>
	updateState(setCapture(data, show))
);
