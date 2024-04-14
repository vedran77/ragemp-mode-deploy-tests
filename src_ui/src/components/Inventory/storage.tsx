import React from 'react';
import PrimaryTitle from 'components/Common/primary-title';
import Grid from './grid';
import Indicator from './indicator';
import withStorage, { WrappedProps } from './with-storage';

const types: { [name: string]: string } = {
	player: 'Građanin',
	vehicle: 'Gepek',
	house: 'Sef',
	faction: 'Sklađište',
};

function InventoryStorage({ name, cells, getItemsForCells }: WrappedProps) {
	return (
		<div className="inventory_storage">
			<div className="inventory_storage-container">
				<PrimaryTitle className="inventory_title">{types[name]}</PrimaryTitle>

				<Grid
					items={getItemsForCells()}
					startIndex={0}
					cells={cells > 30 ? cells : 30}
					available={cells}
					storage={name}
				/>
			</div>
		</div>
	);
}

export default withStorage(InventoryStorage);
