import mongoose from 'mongoose';

const { Schema } = mongoose;

type Vehicle = {
	owner?: string;
	oldOwners?: string[];
	name: string;
	govNumber: string;
	fuel: number;
	position?: {
		position: PositionEx;
		rotation: number;
	};
	state: {
		[key: string]: any;
	};
	tuning: {
		[key: string]: any;
	};
	faction?: string;
	inventory: InventoryItem[];
} & mongoose.Document;

const vehicleSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'Character',
	},
	oldOwners: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
	faction: String,
	name: {
		type: String,
		required: true,
	},
	govNumber: {
		type: String,
		unique: true,
		required: true,
	},
	fuel: {
		type: Number,
		required: true,
	},
	position: Object,
	rotation: Object,
	state: {
		type: Object,
		default: {},
	},
	tuning: {
		type: Object,
		default: {},
	},
	inventory: {
		type: Array,
		default: [],
	},
});

const Vehicle = mongoose.model<Vehicle>('Vehicle', vehicleSchema);

export default Vehicle;
