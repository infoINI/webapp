var React = require('react');


module.exports = React.createClass({
    render: function () {
        return this.transferPropsTo(React.DOM.div(
            {className: 'page'},
            React.DOM.div(
                { className: 'header'},
                React.DOM.div(
                    { className: 'content'},
                    React.DOM.h1(
                        null,
                        /*React.DOM.a({href:'#', className:'up'},'↥'),*/
                        this.props.pageTitle
                    )
                )
            ),
            React.DOM.div(
                { className: 'main'},
                this.props.children
            ),
            React.DOM.div({ style: {clear: 'both'}})
        ));
    },
    getDefaultProps: function () {
        return {
            pageTitle: 'Page',
            id: 'noId'
        };
    }
});


