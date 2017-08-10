import React, { Component } from 'react';
import RefreshIndicator from './hacks/BetterRefreshIndicator.js';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

import PasswordClient from './services/password-client.js';

export default class PasswordDetailDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            password: undefined,
            open: false
        };
    }

    componentDidMount() {
        this.client = new PasswordClient();
    }

    componentWillReceiveProps(newProps) {
        if (newProps !== this.state) {
            this.setState({ open: newProps.open });
            if (newProps.open == false && this.props.open == true) this.props.onDialogClose();

            if (newProps.name && newProps.encryptionKey) {
                this.client.getPassword(newProps.name, newProps.encryptionKey)
                    .then(password => {
                        this.setState({ password, loading: false })
                    })
                    .catch(err => console.error(err));
            }
        }
    }

    handleDialogClose = () => {
        this.setState({open: false});
        if (this.props.onDialogClose) this.props.onDialogClose();
    }

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleDialogClose}
            />
        ];

        let content;
        if (this.state.loading) {
            content = (
                <RefreshIndicator size={40} className='refresh' status='loading' />
            );
        } else {
            content = (<span>{this.state.password}</span>);
        }

        return (
            <Dialog
                title={this.props.name}
                modal={false}
                actions={actions}
                open={this.state.open}
                onRequestClose={this.handleDialogClose}
            >
                {content}
            </Dialog>
        );
    }
}