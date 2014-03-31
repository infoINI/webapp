// jquery is already attached to window
require('./lib/isOnScreen.js');

var Q = require('q');
var React = require('react');

var Page = require('./lib/page.js');


var PageStock = React.createClass({
    render: function () {
        return this.transferPropsTo(Page(
            {
                id: 'stock',
                title: 'Bestand'
            },
            this.renderItems()
        ));
    },
    renderItems: function () {
        if (this.state.items) {
            return this.state.items.map(this.renderItem);
        }
        return '...';
    },
    renderItem: function (item) {
        return React.DOM.div(
            {
                className: 'row'
            },
            item.name + ' (' + item.price + '€) noch ' + item.count + ' verfügbar'
        );
    },
    getDefaultProps: function () {
        return {
            urlStock: 'http://localhost:3001/stock.json'
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


  // handler
  ///////////////////////////////////////////////////////////////////////////////
  var ajax_handler = {
        status: function(data,textStatus) {
            var setLevel = function(bar, level)  {
                    var percent=level+'%'
                    bar.find('.text').text(percent);
                    bar.find('.bar').animate({'width':percent},600);

            };
            var setTuer = function(open)  {
                    var t = $('#tuer');
                    t.removeClass((!open)?'open':'closed');
                    t.addClass(open?'open':'closed');
                    t.text('Tür '+ (open?'offen':'geschlossen'));
            };

            setTuer(data.status == "OPEN");
            setLevel($('#kanne1'),data.pots[0].level || 0);
            setLevel($('#kanne2'),data.pots[1].level || 0);
        },
        members: function(data,textStatus) {
            var $container = $('#page_members .main');
            $container.html("");
            $(data.members).each(function(i,d) {
                    var content = ''
                            +'<div class="member_img"><img src="'+d.photo_url+'"/><\/div>'
                            +'<div class="member_name"><a name="#">'+d.firstname+' '+d.lastname+'<\/a><\/div>'
                            +'<div class="member_position">'+d.position+'<\/div>'
                            +'<div class="member_mail">✉ '+d.email+'<\/div>'
                            +'<div class="member_course">'+d.course_of_study+'<\/div>'
                            ;

                    var member = $('<div class="row member '+((i%2==0)?'alt':'')+'">' + content + '<\/div>');
                    member.click(function() {
                            $('.member').removeClass('active');
                            member.addClass('active');      
                    });
                    $container.append(member);
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
                console.log('error: '+errorThrown);
        },
        /*
        vote: function(data,textStatus) {
            var $container = $('#page_vote .main');
            //$container.html("");
            $(data.members).each(function(i,d) {
                    var content = ''
                            +'<div class="member_img"><img src="'+d.photo_url+'"/><\/div>'
                            +'<div class="member_name"><a name="#">'+d.firstname+' '+d.lastname+'<\/a><\/div>'
                            +'<div class="member_comment">'+d.comment+'<\/div>'
                            +'<div class="member_mail">✉ '+d.email+'<\/div>'
                            +'<div class="member_course">'+d.course_of_study+'<\/div>'
                            ;

                    var member = $('<div class="row member '+((i%2==0)?'alt':'')+'">' + content + '<\/div>');
                    member.click(function() {
                            $('.member').removeClass('active');
                            member.addClass('active');      
                    });
                    $container.append(member);
            });
        },
        */
        news: function(data,textStatus) {
                var items = [];
                var $xml = $(data);
                $xml.find("entry").each(function() {
                        var $this = $(this),
                                item = {
                                        title: $this.find("title").text(),
                                        link: $this.find("link").attr('href'),
                                        content: $this.find("content").text(),
                                        updated: $this.find("updated").text(),
                                        author: $this.find("author>name").text()
                        }
                        items.push(item);
                });

                $('#news').html('');
                for(var i in items) {
                        var title = '<h2>'+items[i].title+'<\/h2>';
                        var content = '<p>'+items[i].content+'<\/p>';
                        var newsitem = '<div>'+title + content+'<\/div>';
                        $('#news').append(newsitem);
                        if(i==0) break; // only one item for now
                }
        }
  };

  var lazy_members_loaded = false;
  var handler_lazy_members = function() {
        if($('#page_members').isOnScreen() && !lazy_members_loaded) {
                $.ajax('http://infoini.de/api/members.json',{'success':ajax_handler.members});
                lazy_members_loaded = true;
        }
  };
  /*
  var lazy_vote_loaded = false;
  var handler_lazy_vote = function() {
        if($('#page_vote').isOnScreen() && !lazy_vote_loaded) {
                $.ajax('http://infoini.de/api/vote.json',{'success':ajax_handler.vote});
                lazy_vote_loaded = true;
        }
  };
  */

  // main 
  ///////////////////////////////////////////////////////////////////////////////
  $(document).ready(function() {
        React.renderComponent(PageStock(), document.getElementById('react-container'));
        
        var demo =window.location.search == '?demo';

        // load members only if they become visible
        $(window).scroll(handler_lazy_members);
        $(window).resize(handler_lazy_members);
        //$(window).scroll(handler_lazy_vote);
        //$(window).resize(handler_lazy_vote);

    var update = function() {
            $.ajax('http://infoini.de/api/combined.json',{success:ajax_handler.status,cache:false,ifModified:false} );
    };
    var UPDATE_INTERVAL = 60 * 1000;

    var updateSlow = function() {
            $.get('http://infoini.de/redmine/projects/fsropen/news.atom',{}, ajax_handler.news);
    };
    var UPDATE_INTERVAL_SLOW = 60 * 1000;


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
    $('#nav').onePageNav({    scrollOffset: 40, scrollOffset: 300 });
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
        }
        if(demo) window.setInterval(slide,20*1000);

    // refresh
    update();
    setInterval(update,UPDATE_INTERVAL);
    updateSlow();
    setInterval(updateSlow,UPDATE_INTERVAL_SLOW);

    // show store link on android
    if(navigator.userAgent.toLowerCase().indexOf("android") > -1 ) {
        $('.store_link.android').show();
    }

    // setup react components
  });

