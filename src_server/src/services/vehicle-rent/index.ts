import VehicleRent from './rent';

type RentPoint = {
  name: string;
  blip: BlipsOptions;
  vehicleModel: string;
  price: number;
  license?: string;
};

const points: RentPoint[] = [
  {
    name: 'scooter_rent',
    blip: { name: 'Iznajmljivanje skutera', model: 522, color: 4 },
    vehicleModel: 'faggio2',
    price: 150,
  },
  {
    name: 'boat_rent',
    blip: { name: 'Iznajmljivanje čamaca', model: 780, color: 4 },
    vehicleModel: 'dinghy',
    price: 2500,
    license: 'boat',
  },
];

points.forEach((point) => {
  const { name, blip, vehicleModel, price, license } = point;
  return new VehicleRent(name, blip, vehicleModel, price, license);
});
