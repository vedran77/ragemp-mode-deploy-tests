import React from 'react';
import { Provider } from 'react-redux';
import { createHashHistory } from 'history';
import { ToastContainer, Zoom, Bounce } from 'react-toastify';

import moment from 'moment-timezone';
import Routes from 'routes';
import store from 'store';
import rpc from 'utils/rpc';
import Chat from 'components/Chat';
import 'moment/locale/sr';

import 'assets/styles/framework7/index.less';
import 'react-toastify/dist/ReactToastify.min.css';
import 'rc-slider/assets/index.css';
import 'assets/styles/index.scss';

moment.tz.setDefault('Europe/Belgrade');

const history = createHashHistory();

rpc.register('Browser-ShowPage', (page: string, data = {}) => {
	const path = `/${page}`;

	if (history.location.pathname === path) history.push('/', {});
	history.push(path, data);
});

export default function App() {
	return (
		// <Hud />
		<Provider store={store}>
			<Routes history={history} />

			<Chat />

			<ToastContainer
				enableMultiContainer
				containerId="hud"
				className="notifications"
				toastClassName="notifications-item"
				bodyClassName="notifications-body"
				position="bottom-center"
				transition={Zoom}
				autoClose={2300}
				closeButton={false}
				draggable={false}
				limit={1}
				newestOnTop
			/>
			<ToastContainer
				enableMultiContainer
				containerId="menu"
				className="menu-notifications"
				toastClassName="menu-notifications-item"
				bodyClassName="menu-notifications-body"
				position="top-center"
				transition={Bounce}
				autoClose={2300}
				closeButton={false}
				draggable={false}
				limit={1}
				newestOnTop
			/>
		</Provider>
	);
}
