import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import rpc from 'utils/rpc';
import { StoreState } from 'store';
import { sendMessage } from 'store/app/actions';
import { commandsList, COMMANDS } from './data';
import Messages from './messages';
import Form from './form';
import { prepareValue } from './form/validation';

type Props = {} & ReturnType<typeof mapStateToProps> &
	typeof mapDispatchToProps;
type State = {
	visible: boolean;
	showMessages: boolean;
	showForm: boolean;
	message?: string;
	messages: string[];
};

export const messagesRef = React.createRef<HTMLUListElement>();
export const inputRef = React.createRef<HTMLInputElement>();

let iMessage = -1;
class Chat extends Component<Props, State> {
	private visibilityTimeout: NodeJS.Timeout | undefined;

	readonly state: State = {
		visible: false,
		showMessages: false,
		showForm: false,
		messages: [],
	};

	componentDidMount() {
		this.registerToEvents();

		this.scrollDown();
		this.showMessages(true);
	}

	componentDidUpdate(prevProps: Props) {
		const { messages } = this.props;

		if (prevProps.messages.length < messages.length) {
			iMessage = this.state.messages.length;

			this.showMessages(!this.state.showForm);
			this.scrollDown();
		}
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.keyHandler);
		(mp as any).invoke('setTypingInChatState', false);
	}

	registerToEvents() {
		const api = {
			'chat:push': this.addMessage.bind(this),
			'chat:activate': this.toggleMenu.bind(this),
			'chat:show': (status: boolean) => {
				this.setState(() => ({ visible: status }));
			},
		};

		document.addEventListener('keydown', this.keyHandler);
		if (!mp?.events) return;

		Object.entries(api).forEach(([event, callback]) => {
			mp.events.add(event, callback);
		});
		(window as any).chatAPI = {
			push: api['chat:push'],
			activate: api['chat:activate'],
			show: api['chat:show'],
		};
	}

	keyHandler = (ev: KeyboardEvent) => {
		const { visible, showForm } = this.state;
		const { activeElement } = document;

		if (
			visible &&
			!showForm &&
			ev.keyCode === 84 &&
			activeElement?.tagName !== 'INPUT' &&
			activeElement?.tagName !== 'TEXTAREA'
		) {
			this.toggleMenu(true);
		}

		if (visible && showForm && ev.key === 'Escape') {
			this.setState({ message: '' });
			this.toggleMenu(false);
		}

		if (
			visible &&
			showForm &&
			['ArrowUp', 'ArrowDown'].includes(ev.key) &&
			this.state?.messages?.length &&
			inputRef?.current
		) {
			ev.preventDefault();

			if (ev.key === 'ArrowUp') {
				if (iMessage === 0) return;

				iMessage--;

				const message = this.state.messages?.[iMessage];
				this.setState({ message });
			} else if (ev.key === 'ArrowDown') {
				if (iMessage === this.state.messages.length) {
					this.setState({ message: '' });
					return;
				}

				iMessage++;

				const message = this.state.messages?.[iMessage];
				this.setState({ message });
			}

			inputRef?.current?.setSelectionRange(-1, -1);
		}
	};

	scrollDown() {
		if (!messagesRef.current) return;
		messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
	}

	toggleMenu(status?: boolean) {
		const enabled = status ?? !this.state.showForm;

		iMessage = this.state.messages.length;

		this.setState(() => ({ showForm: enabled }));

		(mp as any).invoke('focus', enabled);
		(mp as any).invoke('setTypingInChatState', enabled);

		if (enabled) setTimeout(() => inputRef?.current?.focus(), 10);
		this.showMessages(!enabled);
	}

	showMessages(autoHide: boolean) {
		this.setState(() => ({ showMessages: true }));

		if (this.visibilityTimeout) {
			clearTimeout(this.visibilityTimeout);
			this.visibilityTimeout = undefined;
		}

		if (autoHide) {
			this.visibilityTimeout = setTimeout(
				() => this.setState(() => ({ showMessages: false })),
				30000
			);
		}
	}

	async addMessage(text: string) {
		const prepared: string = await rpc.callClient(
			'PlayerFriends-PrepareString',
			text
		);

		this.props.sendMessage(prepared);
	}

	getMode(text: string) {
		if (text[0] !== '/') return null;

		const command = text.split(' ')[0]?.replace('/', '');
		return (commandsList as any)[command?.toLowerCase()] ? command : null;
	}

	sendMessage(value: string) {
		if (!value.length) {
			this.toggleMenu();
			return;
		}

		const text = prepareValue(value).trim();
		const mode = this.getMode(text);

		const messages = this.state.messages.slice(0);
		if (messages.includes(value)) {
			const messIndex = messages.indexOf(value);
			messages.splice(messIndex, 1);
		}

		messages.push(value);
		iMessage = messages.length;
		this.setState({
			message: '',
			messages: [...new Set(messages)].filter(Boolean),
		});

		if (text[0] === '/' && !mode) {
			const word = text.split(' ')[0];

			(mp as any).invoke(
				'command',
				text
					?.replace(new RegExp(word, 'gi'), word.toLowerCase())
					.substring(1)
			);
		} else if (text.length) {
			(mp as any).invoke(
				'chatMessage',
				JSON.stringify({
					mode: mode
						? (commandsList as any)[mode?.toLowerCase()]
						: COMMANDS.SAY,
					text: text.replace(`/${mode}`, '').trim(),
				})
			);
		}

		this.toggleMenu();
	}

	render() {
		const { visible, showForm, showMessages } = this.state;

		return (
			<div
				className={classNames('chat', { active: showForm })}
				style={{
					display: visible ? 'block' : 'none',
				}}
			>
				<Messages active={showMessages} items={this.props.messages} />

				{showForm && (
					<Form
						message={this.state?.message}
						onSubmit={this.sendMessage.bind(this)}
					/>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state: StoreState) => ({
	messages: state.app.chat,
});
const mapDispatchToProps = {
	sendMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
