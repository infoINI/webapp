var React = require('react');


var LinkMore = React.createClass({
    render: function () {
        return React.DOM.div(
            {
                className: 'linkMore row noDemo'
            },
            React.DOM.a({ href: this.props.link }, this.props.text)
        );
    },
    getDefaultProps: function () {
        return {
            text: 'Mehr...',
            link: '#'
        };
    }
});


module.exports = LinkMore;
