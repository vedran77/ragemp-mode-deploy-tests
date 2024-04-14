import React from 'react';
// @ts-ignore
import { usePreview } from 'react-dnd-preview';
import images from 'utils/images';
import { isClothes } from './item';

export default function InventoryPreview() {
	const { display, item, style } = usePreview();

	if (!item || !display) return null;

	const clothName = isClothes(item?.name);

	return (
		<div className="inventory_preview" style={style}>
			<img
				src={
					clothName && item?.data?.gender
						? images.getImage(
								`${item?.data?.style}_${item?.data?.color}.png`,
								`inventory/clothes/${item?.data?.gender}/${clothName}`
						  )
						: images.getImage(`${item?.name}.png`, 'inventory')
				}
				alt={item.name}
			/>
		</div>
	);
}
