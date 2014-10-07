var React = require('react');
var Page = require('./page.js');


var Member = React.createClass({
    render: function () {
        return React.DOM.div(
            {
                className: 'row member ' + ((this.props.i % 2 === 0) ? 'alt' : '') + (this.state.active && ' active'),
                onClick: this.handleClick
            },
            React.DOM.div({className: 'member_img'}, React.DOM.img({src: this.props.photo_url})),
            React.DOM.div({className: 'member_name'}, React.DOM.a({name: ''}, this.props.firstname + ' ' + this.props.lastname)),
            React.DOM.div({className: 'member_position'}, this.props.position),
            React.DOM.div({className: 'member_mail'}, '✉ ' + this.props.email),
            React.DOM.div({className: 'member_course'}, this.props.course_of_study)
        );

    },
    handleClick: function () {
        this.setState({active: !this.state.active});
    },
    getInitialState: function () {
        return { active: false };
    }
});


var PageMember = React.createClass({
    render: function () {
        return this.transferPropsTo(
            Page(
                null,
                this.renderMembers()
            )
        );
    },
    renderMembers: function () {
        if (this.state.items) {
            var items = this.state.items.map(function (item, i) {
                item.i = i;
                return Member(item);
            });
            return React.DOM.div({}, items);
        }
        return 'Leer';
    },
    getMembers: function () {
        if (!$(this.getDOMNode()).isOnScreen() || this.state.items || this.state.loading) {
            return;
        }

        var c = this;
        c.setState({loading: true});
        $.get(this.props.url, function (data) {
            c.setState({loading: false});
            c.setState({items: data.members});
        });
    },
    componentDidMount: function () {
        var c = this;
        $(window).scroll(function () {
            c.getMembers();
        });
        $(window).resize(function () {
            c.getMembers();
        });
    },
    getInitialState: function () {
        return {
            items: false,
            loading: false
        };
    },
    getDefaultProps: function () {
        return {
            id: 'member',
            pageTitle: 'Mitglieder'
        };
    }
});

module.exports = PageMember;
