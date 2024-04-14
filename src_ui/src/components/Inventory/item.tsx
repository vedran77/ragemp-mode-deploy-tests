import React, { useContext } from 'react';
import { useDrag } from 'react-dnd';
import images from 'utils/images';
import InventoryContext from './context';

type Props = {
	id: number | string;
	name: string;
	amount: number;
	itemData?: { [name: string]: any };
	storage?: string;
	hideAmount?: boolean;
};

const clothes = ['hat', 'mask', 'glasses', 'accessories', 'jacket', 'shirt', 'pants', 'shoes'];

export const isClothes = (name: string) => {
	if (clothes.includes(name)) {
		if (name === 'jacket') return 'shirt';

		return name;
	}
};

export default function InventoryItem({ id, name, amount, itemData, storage = 'self', hideAmount }: Props) {
	const { selectItem } = useContext(InventoryContext)!;

	const [, drag] = useDrag({
		item: {
			id,
			name,
			storage,
			data: itemData,
			type: 'item',
		},
	});

	const clothName = isClothes(name);

	return (
		<div
			ref={drag}
			className="inventory_item"
			id={`item-${id}`}
			onClick={() => selectItem({ cell: id, name, amount, storage })}
		>
			<img
				src={
					clothName && itemData?.gender
						? images.getImage(
								`${itemData?.style}_${itemData?.color}.png`,
								`inventory/clothes/${itemData?.gender}/${clothName}`
						  )
						: images.getImage(`${name}.png`, 'inventory')
				}
				alt={name}
			/>

			{!hideAmount && <span className="inventory_item-amount">{amount}</span>}
		</div>
	);
}
