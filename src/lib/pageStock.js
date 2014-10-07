var Q = require('q');
var React = require('react');
var Page = require('./page.js');
var LinkMore = require('./linkMore.js');


var PageStock = React.createClass({
    render: function () {
        return this.transferPropsTo(Page(
            null,
            this.renderItems(),
            LinkMore({
                text: 'Verlauf',
                link: 'http://infoini.de/munin/infoini/infoini/cafe_stock.html'
            })
        ));
    },
    renderItems: function () {
        if (this.state.items) {
            var items = this.state.items.filter(function (item) {
                return item.name !== 'Unknown';
            }).map(this.renderItem);
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
        }
        return '...';
    },
    renderItem: function (item) {
        return React.DOM.tr(
            {
                className: 'row'
            },
            React.DOM.td(null, item.name),
            React.DOM.td({ style: { textAlign: 'right' }}, item.count)
        );
    },
    getDefaultProps: function () {
        return {
            id: 'stock',
            pageTitle: 'Bestand',
            urlStock: '//infoini.de/api/stock.json'
        };
    },
    getInitialState: function () {
        return {
            items: null
        };
    },
    componentDidMount: function () {
        this.getData();
    },
    getData: function () {
        var component = this;
        Q($.getJSON(this.props.urlStock)).then(function (data) {
            console.log(data);
            component.setState({items: data});
        }).fail(function (a) {
            console.error(a);
        }).done();
    }
});


module.exports = PageStock;
