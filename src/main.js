// jquery is already attached to window
require('./lib/isOnScreen.js');

var Q = require('q');
var React = require('react');
var io = require('socket.io-client');
window.io = io;


var Page = require('./lib/page.js');
var PageStatus = require('./lib/pageStatus.js');
var PageNews = require('./lib/pageNews.js');
var PageDonations = require('./lib/pageDonations.js');
var PageMember = require('./lib/pageMember.js');
var PageHtml = require('./lib/pageHtml.js');
var Notification = require('./lib/notification.js');




// qr code contains link to the webapp: http://infoini.de/webapp/



var App = React.createClass({
    render: function () {
        return React.DOM.div(
            null,
            Notification({ref: 'notification'}),
            PageStatus(),
            PageNews(),
            PageDonations(),
            //PageStock({ref: 'stock'}),
            PageMember({
                pageTitle: 'Mitglieder',
                url: 'http://infoini.de/api/members.json'
            }),
            PageMember({
                pageTitle: 'Helfer',
                url: 'http://infoini.de/api/helpers.json',
                id: 'helpers'
            }),
            PageHtml({
                pageTitle: 'Ringvorlesung',
                url: 'http://infoini.de/api/ringvorlesung.html',
                id: 'ringvorlesung'
            }),
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
            // hide scrollbars, handle scrolling
            $('body').addClass('demo'); //.css('overflow','hidden');

            // hide irelevant content
            $('.noDemo').hide();

            //$('.demoOnly').show();
            setTimeout(location.reload, 4*60*60*1000);
    }



    // navigation
    $('.page:has(.header:visible):visible').each(function() {
            var text = $(this).find('.header').text();
            var o = $('<a href="#'+$(this).attr('id')+'">'+text+'<\/a>');
            $('#nav').append(o);
    });
    $('#nav').onePageNav({ scrollOffset: 300 });
    $('.page .header h1').each(function() {
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

