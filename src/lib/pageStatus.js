var React = require('react');
var Page = require('./page.js');
var LinkMore = require('./linkMore.js');

var qr_code_data = require('./qrcode.js');


var PageStatus = React.createClass({
    render: function () {
        return this.transferPropsTo(Page(
            null,
            React.DOM.div(
                { className: 'row', style: { textAlign: 'center' }},
                React.DOM.b(
                    null,
                    React.DOM.span({ className: 'symbol' }, '☕'),
                    ' Kaffee Füllstand'
                )
            ),
            React.DOM.div(
                { className: 'row alt cafe_bar', id: 'kanne1' },
                React.DOM.div(
                    {className: 'bar', style: {width: this.state.w1}},
                    React.DOM.div({className: 'text'}, this.state.text1)
                )
            ),
            React.DOM.div(
                { className: 'row cafe_bar', id: 'kanne2' },
                React.DOM.div(
                    {className: 'bar', style: {width: this.state.w2}},
                    React.DOM.div({className: 'text'}, this.state.text2)
                )
            ),
            LinkMore({ link: 'http://infoini.de/munin/infoini/infoini/', text: 'Verlauf'}),
            React.DOM.div(
                { className: 'main noDemo frame_tuer' },
                React.DOM.div(
                    { className: 'row'},
                    React.DOM.div({ id: 'tuer', className: this.state.classTuer}, this.state.textTuer)
                ),
                React.DOM.div(
                    { className: 'row alt' },
                    React.DOM.a({ href: '/api/raumplan.pdf' }, 'Raumplan.pdf')
                ),
                React.DOM.div(
                    { className: 'row' },
                    React.DOM.a({ href: '/api/zuendstoff.pdf' }, 'Zündstoff.pdf')
                )
            ),
            React.DOM.div(
                { className: 'row alt hdOnly qr_code', style: {textAlign: 'center'} },
                React.DOM.img({ src: qr_code_data }),
                React.DOM.div({}, 'http://infoini.de/webapp/')
            )
        ));
    },
    handleStatusUpdate: function (data) {
        var open = data.status === 'OPEN';
        var level1 = data.pots[0].level || 0;
        var level2 = data.pots[1].level || 0;
        this.setState({
            text1: level1 + '%',
            text2: level2 + '%',
            w1: level1 + '%',
            w2: level2 + '%',
            classTuer: open ? 'open' : 'closed',
            textTuer: open ? 'offen' : 'geschlossen'
        });
    },
    componentDidMount: function () {
        this.interval = setInterval(this.updateStatus, 2000);
        this.updateStatus();
    },
    updateStatus: function () {
        $.getJSON('http://infoini.de/api/combined.json', this.handleStatusUpdate);
    },
    componentWillUnmount: function () {
        clearInterval(this.interval);
    },
    getInitialState: function () {
        return {
            text1: '???',
            text2: '???',
            classTuer: '',
            textTuer: ''
        };
    },
    getDefaultProps: function () {
        return {
            id: 'page_status',
            pageTitle: 'Status'
        };
    }
});


module.exports = PageStatus;

