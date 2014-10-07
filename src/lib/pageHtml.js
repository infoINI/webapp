var React = require('react');
var Page = require('./page.js');



var PageHtml = React.createClass({
    render: function () {
        /*jslint nomen: true */
        return this.transferPropsTo(
            Page(
                null,
                React.DOM.div(
                    {
                        className: 'row',
                        dangerouslySetInnerHTML:{__html: this.state.content || 'Leer'}
                    }
                )
            )
        );
    },
    getContent: function () {
        if (!$(this.getDOMNode()).isOnScreen() || this.state.content || this.state.loading) {
            return;
        }

        var c = this;
        c.setState({loading: true});
        $.get(this.props.url, function (data) {
            c.setState({loading: false, content: data});
        });
    },
    componentDidMount: function () {
        var c = this;
        $(window).scroll(function () {
            c.getContent();
        });
        $(window).resize(function () {
            c.getContent();
        });
    },
    getInitialState: function () {
        return {
            content: false,
            loading: false
        };
    },
    getDefaultProps: function () {
        return {
            id: 'html',
            pageTitle: 'HTML',
            url: 'test.html'
        };
    }
});

module.exports = PageHtml;
