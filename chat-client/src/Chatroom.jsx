import React from "react";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import ChatBubbleOutline from "@material-ui/icons/ChatBubbleOutline";
import TextField from "@material-ui/core/TextField";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

const ChatWindow = styled.div`
    position: relative;
    display: inline-flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    width: 420px;
    box-sizing: border-box;
`;
const ChatPanel = styled.div`
    position: relative;
    display: inline-flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    z-index: 1;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 20px ;
    z-index: 1;
    color: #fafafa !important;
    border-bottom: 1px solid;
`;

const Title = styled.p`
    text-align: center;
    font-size: 24px;
`;

const NoDots = styled.div`
    hr {
    visibility: hidden;
    }
`;

const OutputText = styled.div`
    white-space: normal !important;
    word-break: break-all !important;
    overflow: initial !important;
    width: 100%;
    height: auto !important;
    color: #fafafa !important;
`;

const OutputName = styled.div`
    white-space: normal !important;
    word-break: break-all !important;
    overflow: initial !important;
    width: 100%;
    height: auto !important;
    color: #b3b3b3 !important;
`;

const InputPanel = styled.div`
    display: flex;
    align-items: center;
    padding: 20px;
    align-self: center;
    border-top: 1px solid #fafafa;
`;

const ChatroomImage = styled.img`
  position: absolute;
  top: 0;
  width: 100%;
`;

const Scrollable = styled.div`
    height: 100%;
    overflow: auto;
`;

const Overlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: ${props => props.background};
    opacity: ${props => props.opacity};
`;

export default class Chatroom extends React.Component {
    constructor(props, context) {
        super(props, context);

        const { chatHistory } = props;

        this.state = {
            chatHistory,
            input: ""
        };

        this.onInput = this.onInput.bind(this);
        this.onSendMessage = this.onSendMessage.bind(this);
        this.onMessageReceived = this.onMessageReceived.bind(this);
        this.updateChatHistory = this.updateChatHistory.bind(this);
        this.scrollChatToBottom = this.scrollChatToBottom.bind(this);
    }

    componentDidMount() {
        this.props.registerHandler(this.onMessageReceived);
        this.scrollChatToBottom();
    }

    componentDidUpdate() {
        this.scrollChatToBottom();
    }

    componentWillUnmount() {
        this.props.unregisterHandler();
    }

    onInput(e) {
        this.setState({
            input: e.target.value
        });
    }

    onSendMessage() {
        if (!this.state.input)
            return;

        this.props.onSendMessage(this.state.input, (err) => {
            if (err)
                return console.error(err);

            return this.setState({ input: "" });
        });
    }

    onMessageReceived(entry) {
        this.updateChatHistory(entry);
    }

    updateChatHistory(entry) {
        this.setState({ chatHistory: this.state.chatHistory.concat(entry) });
    }

    scrollChatToBottom() {
        this.panel.scrollTo(0, this.panel.scrollHeight);
    }

    render() {
        return (
            <div style={{ height: "100%" }}>
                <ChatWindow>
                    <Header>
                        <Title>
                            {this.props.chatroom.name}
                        </Title>
                        <Button
                            variant="contained"
                            onClick={this.props.onLeave}
                            color="primary">
                            Cancel
                        </Button>
                    </Header>
                    <ChatPanel>
                        <Scrollable innerRef={(panel) => { this.panel = panel; }}>
                            <List>
                                {
                                    this.state.chatHistory.map(
                                        ({ user, message, event }, i) => [
                                            <NoDots>
                                                <ListItem
                                                    key={i}
                                                >
                                                    <Avatar src={user.image} />
                                                    <ListItemText
                                                        primary={
                                                            <OutputName>
                                                                {user.name} {event || ""}
                                                            </OutputName>
                                                        }
                                                        secondary={
                                                            message &&
                                                            <OutputText>
                                                                {message}
                                                            </OutputText>
                                                        }
                                                    />
                                                </ListItem>
                                            </NoDots>,
                                            <Divider inset />
                                        ]
                                    )
                                }
                            </List>
                        </Scrollable>
                        <InputPanel>
                            <TextField
                                label="Enter a message."
                                multiLine
                                rows={4}
                                rowsMax={4}
                                onChange={this.onInput}
                                value={this.state.input}
                                onKeyPress={e => (e.key === "Enter" ? this.onSendMessage() : null)}
                            />
                            <Button
                                variant="fab"
                                onClick={this.onSendMessage}
                            >
                                <ChatBubbleOutline />
                            </Button>
                        </InputPanel>
                    </ChatPanel>
                    <Overlay
                        opacity={0.6}
                        background="#111111"
                    />
                </ChatWindow>
            </div>
        );
    }
}