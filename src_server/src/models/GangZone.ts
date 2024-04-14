import mongoose from 'mongoose';

const { Schema } = mongoose;

type GangZone = {
	position: PositionEx;
	capturedAt: string;
	owner: string;
	radius: number;
} & mongoose.Document;

const gangZoneSchema = new Schema({
	owner: {
		type: String,
		ref: 'Faction',
	},
	position: {
		type: Object,
		required: true,
	},
	capturedAt: {
		type: Date,
		default: Date.now,
	},
	radius: {
		type: Number,
	},
});

const GangZone = mongoose.model<GangZone>('Gangzone', gangZoneSchema);

export default GangZone;
