import rpc from 'utils/rpc';
import { setCall, acceptCall, setWallpaper } from './actions';
import { updateState } from '../index';

rpc.register('Phone-IncomingCall', (phoneNumber: string) => {
	updateState(
		setCall({
			type: 'incoming',
			phoneNumber,
		})
	);
});
rpc.register('Phone-AcceptCall', () => {
	updateState(acceptCall());
	mp.gui.cursor.show(false, false);
});
rpc.register('Phone-DeclineCall', () => updateState(setCall()));
rpc.register('Phone-SetWallpaper', (name: string) =>
	updateState(setWallpaper(name))
);
