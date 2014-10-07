var React = require('react');

var Notification = React.createClass({
    render: function () {
        var style = {};
        if (!this.state.visible) {
            style.display = 'none';
        }
        return React.DOM.div(
            {
                className: 'notification',
                style: style
            },
            this.state.text
        );
    },
    getInitialState: function () {
        return {
            visible: false,
            text: ''
        };
    },
    notify: function (text) {
        this.timeout = setTimeout(this.hide, 8000);
        this.setState({
            visible: true,
            text: text
        });
    },
    hide: function () {
        this.setState({visible: false});
    }
});

module.exports = Notification;
