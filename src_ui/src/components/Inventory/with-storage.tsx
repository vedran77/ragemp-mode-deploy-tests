import React, { Component } from 'react';
import { capitalize } from 'lodash';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import { InventoryItem } from './index';

export type WrappedProps = State & {
	getItemsForCells: () => InventoryItem[];

	setItems: (items: InventoryItem[]) => void;
	setEquipment: (data: State['equipment']) => void;

	transfer(id: number, data?: InventoryItem): void;
	move: (id: number, cell: number) => Promise<void>;
	separate: (target: InventoryItem, amount: number) => Promise<void>;
};

type Props = {
	data: State;
};

type State = {
	name: string;
	items: InventoryItem[];
	cells: number;
	equipment: { [name: string]: InventoryItem };
};

export default function withStorage(WrappedComponent: React.ComponentType<WrappedProps>) {
	return class extends Component<Props, State> {
		readonly state: State = {
			name: 'self',
			items: [],
			equipment: {},
			cells: 0,
		};

		componentDidMount() {
			const { location } = this.props as any;

			if (location?.state) {
				const { storage, ...data } = location.state;

				this.setState(() => data);
			} else {
				this.setState(() => this.props.data);
			}

			rpc.register('Inventory-SetCapacity', this.onChangeCapacity.bind(this));
		}

		componentWillUnmount() {
			rpc.unregister('Inventory-SetCapacity');
		}

		setItems(items: InventoryItem[]) {
			this.setState(() => ({ items }));
		}

		onChangeCapacity(cells: number) {
			this.setState((state) => ({
				cells,
			}));
		}

		getItemsForCells() {
			const data: InventoryItem[] = [];

			this.state.items.forEach((item) => {
				if (item.cell >= 0) data[item.cell] = item;
			});

			return data;
		}

		setEquipment(data: any) {
			this.setState(() => ({ equipment: data }));
		}

		async move(id: number, cell: number) {
			try {
				const items: InventoryItem[] = await rpc.callServer(`Inventory-${capitalize(this.state.name)}Move`, [
					id,
					cell,
				]);

				this.setState(() => ({ items }));
			} catch (err: any) {
				if (err.msg) showNotification('error', err.msg);
			}
		}

		async separate(target: InventoryItem, amount: number) {
			try {
				const { cell } = target;
				const data: InventoryItem = await rpc.callServer(`Inventory-${capitalize(this.state.name)}Separate`, [
					cell,
					amount,
				]);

				this.setState((state) => ({
					items: [
						...state.items.map((item) =>
							item.cell === cell ? { ...item, amount: item.amount - amount } : item
						),
						data,
					],
				}));
			} catch (err: any) {
				if (err.msg) showNotification('error', err.msg);
			}
		}

		transfer(id: number, data: InventoryItem) {
			if (data) {
				const { items } = this.state;
				const isExists = !!items.find((item) => item.cell === data.cell);

				this.setItems(
					isExists ? items.map((item) => (item.cell === data.cell ? data : item)) : [...items, data]
				);
			} else this.setItems(this.state.items.filter((item) => item.cell !== id));
		}

		render() {
			const { name, items, cells, equipment } = this.state;

			return (
				<WrappedComponent
					name={name}
					items={items}
					equipment={equipment}
					cells={cells}
					getItemsForCells={this.getItemsForCells.bind(this)}
					setItems={this.setItems.bind(this)}
					setEquipment={this.setEquipment.bind(this)}
					transfer={this.transfer.bind(this)}
					move={this.move.bind(this)}
					separate={this.separate.bind(this)}
					{...this.props}
				/>
			);
		}
	};
}
