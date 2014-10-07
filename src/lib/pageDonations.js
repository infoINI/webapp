var Q = require('q');
var React = require('react');
var Page = require('./page.js');


var PageDonations = React.createClass({
    render: function () {
        return this.transferPropsTo(Page(
            null,
            this.renderItems()
        ));
    },
    renderItem: function (item) {
        return React.DOM.tr(
            {
                className: 'row'
            },
            React.DOM.td(null, item.item),
            React.DOM.td({ style: { textAlign: 'right' }}, item.price.toFixed(2) + ' €')
        );
    },
    renderItems: function () {
        if (!this.state.items) {
            return '...';
        }

        var items = this.state.items.map(this.renderItem);

        return React.DOM.table(
            {
                style: {
                    width: '100%',
                    padding: '0.5em'
                },
                className: 'row'
            },
            React.DOM.tbody(null, items)
        );
    },
    getDefaultProps: function () {
        return {
            pageTitle: 'Spenden',
            url: 'http://infoini.de/api/donations.json'
        };
    },
    getInitialState: function () {
        return {
            items: false
        };
    },
    getData: function () {
        var component = this;
        Q($.getJSON(this.props.url)).then(function (data) {
            console.log(data);
            component.setState({items: data.donations});
        }).fail(function (a) {
            console.error(a);
        }).done();
    },
    componentDidMount: function () {
        this.getData();
    }
});


module.exports = PageDonations;
