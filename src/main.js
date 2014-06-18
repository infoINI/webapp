// jquery is already attached to window
require('./lib/isOnScreen.js');

var Q = require('q');
var React = require('react');
var io = require('socket.io-client');
window.io = io;

var Page = require('./lib/page.js');


var PageStock = React.createClass({
    render: function () {
        return this.transferPropsTo(Page(
            {
                id: 'stock',
                pageTitle: 'Bestand'
            },
            this.renderItems()
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
                        width: '100%'
                    },
                    className: 'row'
                },
                React.DOM.thead(
                    null,
                    React.DOM.tr(
                        {style: { fontWeight: 'bold'}},
                        React.DOM.td({style: {width: '70%'}}, 'Artikel'),
                        React.DOM.td({}, 'Bestand')
                    )
                ),
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
            React.DOM.td(null, item.count)
        );
    },
    getDefaultProps: function () {
        return {
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

var PageNews = React.createClass({
    render: function () {
        return this.transferPropsTo(Page(
            {
                id: 'news',
                pageTitle: 'News'
            },
            this.renderNews(),
            React.DOM.div(
                { className: 'row alt noDemo' },
                React.DOM.div(
                    { className: 'content'},
                    React.DOM.a({href: 'http://infoini.de/redmine/projects/fsropen/news'}, 'Alle News')
                )
            )
        ));
    },
    getInitialState: function () {
        return {
            items: null
        };
    },
    componentDidMount: function () {
        this.getNews();
    },
    getNews: function () {
        $.get('http://infoini.de/redmine/projects/fsropen/news.atom',{}, this.parseNews);
        this.setState({loading: true});
    },
    parseNews: function (data) {
        var items = [];
        var $xml = $(data);
        $xml.find("entry").each(function() {
                var $this = $(this);
                var item = {
                    title: $this.find("title").text(),
                    link: $this.find("link").attr('href'),
                    content: $this.find("content").text(),
                    updated: $this.find("updated").text(),
                    author: $this.find("author>name").text()
                };
                items.push(item);
        });
        this.setState({items: items.slice(0, 1)});
    },
    renderNews: function() {
        if (this.state.items) {
            return this.state.items.map(function (item) {
                return React.DOM.div(
                    { className: 'row' },
                    React.DOM.h2(null, item.title),
                    React.DOM.p({dangerouslySetInnerHTML:{__html: item.content}})
                );
            });
        }
        if (this.state.loading) {
            return 'Loading...';
        }
        return 'Leer';
    }
});


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
            React.DOM.div({className: 'member_mail'}, '✉' + this.props.email),
            React.DOM.div({className: 'member_course'}, '✉' + this.props.course_of_study)
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
                {
                    id: 'member',
                    pageTitle: 'Mitglieder'
                },
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
        $.get('http://infoini.de/api/members.json', function (data) {
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
    }
});

var qr_code_data = "data:image/png;base64,%20iVBORw0KGgoAAAANSUhEUgAAANgAAADYCAIAAAAGQrq6AAAABnRSTlMA/gABAP1bbA07AAAD7klE%20QVR4nO3dQYpjORBAwfIw979yzQk0oCbVejIR2y7Md/uhRSJ9fX5/f3/gtn9uPwD8/AiRCCGSIEQS%20hEiCEEkQIgn/rv7h8/n8zef4Y6s56Onn352/rp5n9/lvfd8pq+e3IpIgRBKESIIQSRAiCUIkQYgk%20LOeIK7f2L+7OyabmbVPzwlte+b2siCQIkQQhkiBEEoRIghBJECIJ23PElan52dTca2o/3+nvtfuc%20U2q/lxWRBCGSIEQShEiCEEkQIglCJGFsjlizO986Pb+8NS98hRWRBCGSIEQShEiCEEkQIglCJOFr%2054grt84dmxf+PysiCUIkQYgkCJEEIZIgRBKESMLYHLE2J7t1Hnmlth+x9ntZEUkQIglCJEGIJAiR%20BCGSIEQStueItXtEdp2+77g2d3zl97IikiBEEoRIghBJECIJQiRBiCQs54i1/Wq7pt6P+Moc7vXf%20y4pIghBJECIJQiRBiCQIkQQhkrCcI07dd3z6/pKV03O1V+aUp/c1TvVgRSRBiCQIkQQhkiBEEoRI%20ghBJuPZ+xN050+nzwq+b+l5T88JdVkQShEiCEEkQIglCJEGIJAiRhOPnmm/NpXbtPk9tf+Rpp39H%20KyIJQiRBiCQIkQQhkiBEEoRIwth+xF1Tc7jT+/B21eajK6fnoLt/b0UkQYgkCJEEIZIgRBKESIIQ%20SRi7r3nqPPKt88u37nFeOT13PL0/0vsReZIQSRAiCUIkQYgkCJEEIZIwth/x9Nyudi/IrfcR1ng/%20Il9FiCQIkQQhkiBEEoRIghBJ2L6veeX0frupfZC31PYX1s5xWxFJECIJQiRBiCQIkQQhkiBEEj63%205m21OeWUW+eFV07v+5xiRSRBiCQIkQQhkiBEEoRIghBJOL4f8dY55al9crfuTandH7P7+e5Z4UlC%20JEGIJAiRBCGSIEQShEjCtf2Ip9X22+06/fy33h/pnhXShEiCEEkQIglCJEGIJAiRhLH9iLfU7h0+%20fV575da+zylWRBKESIIQSRAiCUIkQYgkCJGE7fuaX3+f4q17lld/f/q+k9Of41wzX0WIJAiRBCGS%20IEQShEiCEEnYniOu1OZhpz//1lzzlfcd7rIikiBEEoRIghBJECIJQiRBiCSMzRFfcWveWTsfXZtf%20WhFJECIJQiRBiCQIkQQhkiBEEr52jvjKfcort+6JnppHumeFJwmRBCGSIEQShEiCEEkQIgljc8Ta%20Pci159l1ev/ilKn/ZysiCUIkQYgkCJEEIZIgRBKESML2HPGVe5xr+/ZuuXVviv2IPEmIJAiRBCGS%20IEQShEiCEEn4vDIP47tZEUkQIglCJEGIJAiRBCGSIEQS/gMnD1r53HbJsQAAAABJRU5ErkJggg==";


var PageStatus = React.createClass({
    render: function () {
        return Page(
            {
                id: 'page_status',
                pageTitle: 'Status'
            },
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
                ),
                React.DOM.div(
                    { className: 'row alt hdOnly qr_code', style: {textAlign: 'center'} },
                    React.DOM.img({ src: qr_code_data }),
                    React.DOM.div({}, 'http://infoini.de/webapp/')
                )
            )
        );
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
    }
});


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

var App = React.createClass({
    render: function () {
        return React.DOM.div(
            null,
            Notification({ref: 'notification'}),
            PageStatus(),
            PageNews(),
            PageStock({ref: 'stock'}),
            PageMember(),
            false
        );
    },
    componentDidMount: function () {
        var component = this;
        this.socket = io.connect('http://infoini.de:80');
        this.socket.on('notify', function (data) {
            console.log(data);
            component.refs.notification.notify(data);
            setTimeout(function () {
                component.refs.stock.getData();
            }, 1000);
        });
    }
});

  // main
  ///////////////////////////////////////////////////////////////////////////////
  $(document).ready(function() {
        React.renderComponent(
            App(),
            document.getElementById('react-container')
        );
        var demo = window.location.search === '?demo';

    // scroll through pages if called with ?demo
    if(demo) {
            // increase update freq
            UPDATE_INTERVAL = 5 * 1000;

            // hide scrollbars, handle scrolling
            //$('body').addClass('demo'); //.css('overflow','hidden');

            // hide irelevant content
            $('.noDemo').hide();
            //$('.demoOnly').show();
            setTimeout(location.reload, 4*60*60*1000);
    }



    // navigation
    $('.page:has(.header:visible):visible').each(function(i) {
            var text = $(this).find('.header').text();
            var o = $('<a href="#'+$(this).attr('id')+'">'+text+'<\/a>');
            $('#nav').append(o);
    });
    $('#nav').onePageNav({ scrollOffset: 300 });
    $('.page .header h1').each(function(i) {
            var up = $('<a href="#" class="up">↥<\/a>');
            $(this).prepend(up);
            up.click(function(e) {
                    e.preventDefault();
                    $.scrollTo(0,600);
            });
    });

        var navLinkCurrent = 1;
        //var navLinks = $('#nav a:visible').get();
        var navLinks = $('.page:has(.header:visible):visible').get();
         var slide = function() {
                        //navLinks[navLinkCurrent].click();       
                 $.scrollTo(navLinks[navLinkCurrent],600);
                        navLinkCurrent++;
                        navLinkCurrent%=navLinks.length;
        };
        if (demo) {
            window.setInterval(slide,20*1000);
        }


    // show store link on android
    if(navigator.userAgent.toLowerCase().indexOf("android") > -1 ) {
        $('.store_link.android').show();
    }

  });

