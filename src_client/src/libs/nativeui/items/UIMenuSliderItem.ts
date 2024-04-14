import BadgeStyle from "../enums/BadgeStyle";
import ResRectangle from "../modules/ResRectangle";
import Sprite from "../modules/Sprite";
import Color from "../utils/Color";
import Point from "../utils/Point";
import Size from "../utils/Size";
import UIMenuItem from "./UIMenuItem";

export default class UIMenuSliderItem extends UIMenuItem {
	private _arrowLeft: Sprite;
	private _arrowRight: Sprite;

	private _rectangleBackground: ResRectangle;
	private _rectangleSlider: ResRectangle;
	private _rectangleDivider: ResRectangle;

	private _items: any[];

	private _index: number;

	get Index() {
		return this._index % this._items.length;
	}
	set Index(value) {
		this._index = 100000000 - (100000000 % this._items.length) + value;
	}

	constructor(
		text: string,
		items: any[],
		index: number,
		description: string = "",
		divider: boolean = false
	) {
		super(text, description);
		const y: number = 0;
		this._items = items;
		this._arrowLeft = new Sprite(
			"commonmenutu",
			"arrowleft",
			new Point(0, 105 + y),
			new Size(15, 15)
		);
		this._arrowRight = new Sprite(
			"commonmenutu",
			"arrowright",
			new Point(0, 105 + y),
			new Size(15, 15)
		);
		this._rectangleBackground = new ResRectangle(
			new Point(0, 0),
			new Size(150, 9),
			new Color(4, 32, 57, 255)
		);
		this._rectangleSlider = new ResRectangle(
			new Point(0, 0),
			new Size(75, 9),
			new Color(57, 116, 200, 255)
		);
		if (divider) {
			this._rectangleDivider = new ResRectangle(
				new Point(0, 0),
				new Size(2.5, 20),
				Color.WhiteSmoke
			);
		} else {
			this._rectangleDivider = new ResRectangle(
				new Point(0, 0),
				new Size(2.5, 20),
				Color.Transparent
			);
		}
		this.Index = index;
	}

	public SetVerticalPosition(y: number) {
		this._rectangleBackground.pos = new Point(
			250 + this.Offset.X + this.Parent.WidthOffset,
			y + 158.5 + this.Offset.Y
		);
		this._rectangleSlider.pos = new Point(
			250 + this.Offset.X + this.Parent.WidthOffset,
			y + 158.5 + this.Offset.Y
		);
		this._rectangleDivider.pos = new Point(
			323.5 + this.Offset.X + this.Parent.WidthOffset,
			y + 153 + this.Offset.Y
		);
		this._arrowLeft.pos = new Point(
			235 + this.Offset.X + this.Parent.WidthOffset,
			155.5 + y + this.Offset.Y
		);
		this._arrowRight.pos = new Point(
			400 + this.Offset.X + this.Parent.WidthOffset,
			155.5 + y + this.Offset.Y
		);

		super.SetVerticalPosition(y);
	}

	public IndexToItem(index: number) {
		return this._items[index];
	}

	public Draw() {
		super.Draw();
		this._arrowLeft.color = this.Enabled
			? this.Selected
				? Color.Black
				: Color.WhiteSmoke
			: new Color(163, 159, 148);
		this._arrowRight.color = this.Enabled
			? this.Selected
				? Color.Black
				: Color.WhiteSmoke
			: new Color(163, 159, 148);
		let offset =
			((this._rectangleBackground.size.Width -
				this._rectangleSlider.size.Width) /
				(this._items.length - 1)) *
			this.Index;
		this._rectangleSlider.pos = new Point(
			250 + this.Offset.X + offset + +this.Parent.WidthOffset,
			this._rectangleSlider.pos.Y
		);
		if (this.Selected) {
			this._arrowLeft.Draw();
			this._arrowRight.Draw();
		} else {
		}
		this._rectangleBackground.Draw();
		this._rectangleSlider.Draw();
		this._rectangleDivider.Draw();
	}

	public SetRightBadge(badge: BadgeStyle) {}

	public SetRightLabel(text: string) {}
}
