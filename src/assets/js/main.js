$(document).ready(function () {
	
	// define all slides
	var slides = [ 	{"id" : "news", "time" : 10000}, {"id" : "twitter", "time" : 10000}, {"id" : "mensa", "time" : 10000}, {"id" : "donations", "time" : 5000}, {"id" : "member", "time" : 5000}, {"id" : "comic", "time" : 15000}];
	
	// define all feed urls
	var feeds = { 	"infoini_news":"http://www.infoini.de/redmine/projects/fsropen/news.atom", 
					"infoini_status" : "http://www.infoini.de/status.json",
					"mensa" : "http://www.studentenwerk-berlin.de/speiseplan/rss/beuth/tag/lang/0",
					"mensa_ini": "http://infoini.de/mensa.xml",
					"twitter" : "infoini",
					"xkcd" : "http://xkcd.com/rss.xml",
					"xkcd_ini" : "http://infoini.de/xkcd.xml"
	};
	
	var getTimes = function() {
		var counter = 0;
		for(i in slides) {
			counter += slides[i].time;
		}
		return counter;
	};

	/** CONSTANTS (no magic numbers :) ) **/
	var INI_STATUS_INTERVAL = 1000;
	var DEFAULT_STARTING_SLIDE = 0;
	var FEED_UPDATE_INTERVAL = 10000;
	var PAGE_REFRESH_INTEVAL = getTimes();
	var ENABLE_SLIDESHOW = true;
	var DEBUG_MODUS = false;
	
	var log = function(msg) {
		if(DEBUG_MODUS) console.log(msg);
	};
	
	// days of the week
    var weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

	// default coffee level
	var cafe_level = 0;

	/** FEED HANDLER **/
	
	// handle ini status : cafe, time, potentielly door
    var iniStatusHandler = function (data, textStatus) {
        log("onSuccess_status");
        //$('.tuer').text(data.tuer_offen?'offen':'geschlossen');
		//data = jQuery.parseJSON(data); for firefox, no need for chrome for some weird reason
        var kanne1_lvl = data.cafepots[0].level;
        var kanne1_text = data.cafepots[0].status;
        var kanne1_height = 0;
        if (kanne1_lvl) {
            //$('#pot1_text').text(kanne1_lvl+'%');
        } else {
            //$('#pot1_text').text(kanne1_text);
            kanne1_lvl = 0;
        }
        //$('#pot1_level').stop().animate({'height':kanne1_lvl+'%'});
        cafe_level = kanne1_lvl;
		
		// TODO WARNING ON LOW LEVEL
    };

	// handle infoini.de news
    var newsHandler = function (data, textStatus) {
        log("onSuccess_news");
        var items = [];
        var $xml = $(data);
        $xml.find("entry").each(function () {
            var $this = $(this),
                item = {
                    title: 		$this.find("title").text(),
                    link: 		$this.find("link").attr('href'),
                    content: 	$this.find("content").text(),
                    updated: 	$this.find("updated").text(),
                    author: 	$this.find("author>name").text()
                }
            items.push(item);
        });

        $('#news-content').html('');
        for (var i in items) {
			$('#news-header').html('');
			$('#news-header').append('<p id="news-header">News - ' + items[i].title + '</p>');
            $('#news-content').append('<div>' + items[i].content + '</div>');
            if (i == 0) break;
        }
    };
	
	// handle mensa feed
	var mensaHandler = function (data, textStatus) {
        log("onSuccess Mensa");
		
		// xml to html and hide it so we can use jquery selectors; TODO refactor to parse xml directly
        var $xml = $(data);
		var description = $xml.find("description");
		$('#food_raw').html('');
		$('#food_raw').append($(description).text());
		$('#food_raw').hide();

		// build dish item (remove incredient reference numbers from food)
		var items = [];
		$("div.mensa_day_speise").each(function () {
			var $this = $(this);
			var food = $this.find('.mensa_day_speise_name');
			for(var i in food) {
				food[i] += "<br />";
			}
			var item = { 
				"title" : $this.find('.mensa_day_title').text(),
				"food" : $this.find('.mensa_day_speise_name')
			};
			items.push(item);
		});
	
		// css framework needs '.last' for last element in row
		var leftSideDiv = '<div class="sixcol box round shadow mensa_item">';
		var rightSideDiv = '<div class="fivecol last box round shadow mensa_item">';
	
		// print food
		$('#food').html('');
		for (var i in items) {
			// remove numbers, and replace '\n' with '<br />' after .text()
			$('#food').append(((i%2 == 0) ? leftSideDiv : rightSideDiv) + "<h2>" + items[i].title + '</h2>' + items[i].food.text().replace(/[0-9]/g, '').replace(/\n/g, "<br />") + '</div>');
		}
	};
	
	// handle mensa feed
	var xkcdHandler = function (data, textStatus) {
        log("onSuccess xkcd");
				
		// random number in range
		var randomNumber = function getRandomInt (min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		};
				
		var items = [];
		var appendstuff = function() {
			// append to content
			$("#comic-content").html('');
			// get all comic items (first element is headline)
			var item = items[randomNumber(1,items.length)];
			$("#comic-content").append(item + "<br />");
			$("#comic-content").append($(item).attr("title"));
		};
        var $xml = $(data);
		$xml.find("description").each(function () {
			items.push($(this).text());
		});
		appendstuff();
	};

	/** UPDATE FEEDS **/
    var getUpdate = function () {
        log('getupdate');
        $.get(feeds.infoini_news, newsHandler);
        $.ajax(feeds.infoini_status, {success: iniStatusHandler, cache: false, ifModified: false});
		$.get(feeds.mensa_ini, mensaHandler);
		$.get(feeds.xkcd_ini, xkcdHandler);
    };
    getUpdate();
    setInterval(getUpdate, FEED_UPDATE_INTERVAL);
    setTimeout("location.reload(true);", PAGE_REFRESH_INTEVAL);
	
	/** TWITTER **/
    jQuery(function ($) {
        $("#tweets").tweet({
            query: feeds.twitter,
            avatar_size: 64,
            count: 5,
            loading_text: "loading tweets...",
            refresh_interval: 30
        });
    });

	/** BOTTOMBAR - CAFE STATUS AND DATE **/
    var timeSeparator = false;
    var showStatus = function () {
        // time
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        hours = hours < 10 ? '0' + hours : '' + hours;
        minutes = minutes < 10 ? '0' + minutes : '' + minutes;

        var time = '[ ' + weekdays[date.getDay()] + ', ' + date.getDate() + '.' + date.getMonth() + 1 + '.' + date.getFullYear() + ' ' + hours + (timeSeparator ? '<span style="display:inline-block;width:10px;">:</span>' : '<span style="display:inline-block;width:10px;"> </span>') + minutes + ' ]';
        timeSeparator = !timeSeparator;
        var cafe = '[ CAFE ' + cafe_level + '% ] ';

        $('#date').html(cafe + ' ' + time);
    };
    var timeInterval = setInterval(showStatus, INI_STATUS_INTERVAL);
    showStatus();
	
	/** SLIDES - default hide all, show only one, start with DEFAULT_STARTING_SLIDE **/

	// hide all slides
	var hideAll = function() {
		for(var i = 0; i < slides.length; ++i) {
			$("#"+slides[i].id).hide();
		}
	};
	hideAll();

	// show certain slide
	var showSlide = function(pageNumber) {
		// hide all
		hideAll();
		// display slide
		$("#"+slides[pageNumber].id).show();
	};
	// start with news
	showSlide(DEFAULT_STARTING_SLIDE);
	
	/** AUTOMATIC SLIDES **/
    var pageCounter = DEFAULT_STARTING_SLIDE-1; 
    var slidePage = function () {
        pageCounter = (pageCounter + 1 ) % slides.length;
		if(ENABLE_SLIDESHOW) showSlide(pageCounter);
		setTimeout(slidePage, slides[pageCounter].time);
    };
	slidePage();
	
    //var pageInterval = setInterval(slidePage, SLIDE_INTERVAL);
    //setTimeout(function() { $.scrollTo(pages[2]);},3000);
});
