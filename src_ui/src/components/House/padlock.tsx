import React from 'react';
import { IoIosLock, IoIosUnlock } from 'react-icons/io';
import sounds from 'utils/sounds';

type Props = {
	status: boolean;
	toggle: () => Promise<void>;
};

export default function HousePadlock({ status, toggle }: Props) {
	function toggleLock() {
		toggle().then(() => sounds.play('lock'));
	}

	return (
		<div className="house_padlock" onClick={toggleLock}>
			<div className="house_padlock-icon">{status ? <IoIosLock /> : <IoIosUnlock />}</div>

			<p className="house_padlock-remark">
				Kliknite na bravu da bi ste {status ? 'otključali' : 'zaključali'} kuću
			</p>
		</div>
	);
}
