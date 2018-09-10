import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Avatar from "@material-ui/core/Avatar";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import ListItemText from "@material-ui/core/ListItemText";

export default class UserSelection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            availableUsers: null
        };

        this.handleSelection = this.handleSelection.bind(this);
        this.renderUserItems = this.renderUserItems.bind(this);

        this.props.getAvailableUsers((err, availableHeroes) => {
            this.setState({ availableUsers: availableHeroes });
        });
    }

    handleSelection(selectedHero) {
        this.props.lockHero(selectedHero.name);
    }

    renderUserItems() {
        if (!this.state.availableUsers) {
            return;
        }
        return this.state.availableUsers.map(user => (
            <ListItem
                button
                key={user.name}
                onClick={() => this.handleSelection(user)}
            >
                <Avatar src={user.image} />
                <ListItemText primary={user.name}
                    secondary={user.statusText} />
            </ListItem>
        ));

    }

    render() {
        return (
            <Dialog
                open={this.state.open}
                scroll={this.state.scroll}
            >
                <DialogTitle>Pick your character.</DialogTitle>
                <List>
                    {this.renderUserItems()}
                </List>
                <DialogActions>
                    <Button onClick={this.props.close} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}