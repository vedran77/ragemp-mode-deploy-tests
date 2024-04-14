import { sortBy } from 'lodash';

export function getClosestVehicleInRange(position: Vector3Mp, range: number) {
	const vehicles: VehicleMp[] = [];

	mp.vehicles.forEachInRange(position, range, (vehicle) => vehicles.push(vehicle));

	return sortBy(vehicles, (vehicle) => vehicle.dist(position))[0];
}

export function randomColor(Minimal: number, Maximum: number): [number, number, number] {
	const randomNumber = () => Math.floor(Math.random() * Maximum + Minimal);

	return [randomNumber(), randomNumber(), randomNumber()];
}

export function randomNumber(Minimal: number, Maximum: number) {
	return Math.floor(Math.random() * Maximum + Minimal);
}

export function hexToRGB(hex): RGB {
	return hex.match(new RegExp('(.{' + hex.length / 3 + '})', 'g')).map(function (l) {
		return parseInt(hex.length % 2 ? l + l : l, 16);
	});
}
