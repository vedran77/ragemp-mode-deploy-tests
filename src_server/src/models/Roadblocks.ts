import mongoose from 'mongoose';

const { Schema } = mongoose;

type Roadblock = {
  type: string;
  position: PositionEx;
  heading: number;
  creator: string;
  speed?: number;
} & mongoose.Document;

const roadblockSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  position: {
    type: Object,
    required: true,
  },
  heading: {
    type: Number,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
  },
  speed: {
    type: Number,
  },
});

const Roadblock = mongoose.model<Roadblock>('Roadblock', roadblockSchema);

export default Roadblock;
