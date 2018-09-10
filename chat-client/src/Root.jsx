import React from "react";
// Import routing components
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
// Style files
import "./index.css";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import MainLayout from "./MainLayout";

// Import custom components
import Home from "./Home";
import UserSelection from "./UserSelection";
import Chatroom from "./Chatroom";
import socket from "./socket";

export default class Root extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            user: null,
            isRegisterInProcess: false,
            client: socket(),
            locations: null
        };
        //Chatroom related
        this.onEnterChatroom = this.onEnterChatroom.bind(this);
        this.onLeaveChatroom = this.onLeaveChatroom.bind(this);
        this.getLocation = this.getLocation.bind(this);
        //Hero related
        this.lockHero = this.lockHero.bind(this);
        this.renderUserSelectionOrRedirect = this.renderUserSelectionOrRedirect.bind(this);
        this.getLocation();
    }
    onEnterChatroom(locationName, onNoUserSelected, onEnterSuccess) {
        if (!this.state.user) {
            return onNoUserSelected();
        }

        return this.state.client.join(locationName, (err, chatHistory) => {
            if (err) {
                return console.error(err);
            }
            return onEnterSuccess(chatHistory);
        });
    }

    onLeaveChatroom(locationName, onLeaveSuccess) {
        this.state.client.leave(locationName, (err) => {
            if (err)
                return console.error(err);
            return onLeaveSuccess();
        });
    }


    getLocation() {
        this.state.client.getLocation((err, locations) => {
            this.setState({ locations: locations });
        });
    }

    /**
     * Register which hero the client selected and remove from the possible selections
     * @param {String} name 
     */
    lockHero(name) {
        const onRegisterResponse = user => this.setState({ isRegisterInProcess: false, user });
        this.setState({ isRegisterInProcess: true });
        this.state.client.lockHero(name, (err, user) => {
            if (err) return onRegisterResponse(null);
            return onRegisterResponse(user);
        });
    }

    /**
     * Method to redirect or open the dialog for character selection
     * @param {function} toHome handle close window
     */
    renderUserSelectionOrRedirect(toHome) {
        let resp;
        // If user is already selected, redirect to home page to choose a room
        if (this.state.user) {
            resp = <Redirect to="/" />;
        } else if (this.state.isRegisterInProcess) {
            resp = <div> loading...</div>;
        } else {
            resp = <UserSelection
                getAvailableUsers={this.state.client.getAvailableUsers}
                close={toHome}
                lockHero={name => this.lockHero(name, toHome)}
            />;
        }
        return resp;
    }

    renderChatroomOrRedirect(chatroom, { history }) {
        if (!this.state.user) {
            return <Redirect to="/" />;
        }

        const { chatHistory } = history.location.state;

        return (
            <Chatroom
                chatroom={chatroom}
                chatHistory={chatHistory}
                user={this.state.user}
                onLeave={
                    () => this.onLeaveChatroom(
                        chatroom.name,
                        () => history.push("/")
                    )
                }
                onSendMessage={
                    (message, cb) => this.state.client.message(
                        chatroom.name,
                        message,
                        cb
                    )
                }
                registerHandler={this.state.client.registerHandler}
                unregisterHandler={this.state.client.unregisterHandler}
            />
        );
    }

    render() {
        return (
            <Router>
                <MuiThemeProvider>
                    <MainLayout user={this.state.user}>
                        {!this.state.locations
                            ? <div>Loading...</div>
                            : (
                                <Switch>
                                    <Route exact path="/" render={
                                        props => (
                                            <Home
                                                user={this.state.user}
                                                chatrooms={this.state.locations}
                                                onChangeUser={() => props.history.push("/user")}
                                                onEnterChatroom={
                                                    chatroomName => this.onEnterChatroom(
                                                        chatroomName,
                                                        () => props.history.push("/user"),
                                                        chatHistory => props.history.push({
                                                            pathname: chatroomName,
                                                            state: { chatHistory }
                                                        })
                                                    )
                                                }
                                            />
                                        )
                                    } />
                                    <Route exact path="/user" render={
                                        (props) => {
                                            const toHome = () => props.history.push("/");
                                            return this.renderUserSelectionOrRedirect(toHome);
                                        }}
                                    />
                                    {
                                        this.state.locations.map(location => (
                                            <Route
                                                key={location.name}
                                                exact path={`/${location.name}`}
                                                render={
                                                    props => this.renderChatroomOrRedirect(location, props)
                                                }
                                            />
                                        ))
                                    }
                                </Switch>)}
                    </MainLayout>
                </MuiThemeProvider>
            </Router>
        );
    }
}