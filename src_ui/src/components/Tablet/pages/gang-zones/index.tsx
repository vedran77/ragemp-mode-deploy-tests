import React, { Component } from 'react';
import {
	Page,
	Navbar,
	BlockHeader,
	BlockFooter,
	List,
	ListItem,
	ListButton,
} from 'framework7-react';
import { showNotification } from 'utils/notifications';
import rpc from 'utils/rpc';
import prettify from 'utils/prettify';

type State = {
	zones: number;
	income: number;
};

export default class GangZones extends Component<{}, State> {
	readonly state: State = {
		zones: 0,
		income: 0,
	};

	componentDidMount() {
		rpc.callServer('GangZones-GetInfo').then((data) =>
			this.setState(() => data)
		);
	}

	render() {
		const { zones, income } = this.state;

		return (
			<Page>
				<Navbar title="Teritorije" />

				<BlockHeader>Vaše teritorije</BlockHeader>
				<List inset>
					<ListItem title="Pod Kontrolom" after={zones.toString()} />
					<ListItem
						title="Profit po satu"
						after={prettify.price(income)}
					/>
				</List>
			</Page>
		);
	}
}
