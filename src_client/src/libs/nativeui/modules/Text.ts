import Color from '../utils/Color';
import Point from '../utils/Point';
import IElement from './IElement';
import ResText from './ResText';

export default class Text extends IElement {
	public caption: string;
	public pos: Point;
	public scale: number;
	public color: Color;
	public font: number;
	public centered: boolean;
	constructor(caption, pos, scale, color, font, centered) {
		super();
		this.caption = caption;
		this.pos = pos;
		this.scale = scale;
		this.color = color || new Color(255, 255, 255, 255);
		this.font = font || 0;
		this.centered = centered || false;
	}

	Draw(caption, pos, scale, color, font, centered) {
		if (caption && !pos && !scale && !color && !font && !centered) {
			pos = new Point(
				this.pos.X + caption.Width,
				this.pos.Y + caption.Height
			);
			scale = this.scale;
			color = this.color;
			font = this.font;
			centered = this.centered;
		}
		const x = pos.X / 1280.0;
		const y = pos.Y / 720.0;

		mp.game.ui.setTextFont(parseInt(font));
		mp.game.ui.setTextScale(scale, scale);
		mp.game.ui.setTextColour(color.R, color.G, color.B, color.A);
		mp.game.ui.setTextCentre(centered);
		mp.game.ui.setTextEntry('STRING');
		ResText.AddLongString(caption);
		mp.game.ui.drawText(x, y);
	}
}
