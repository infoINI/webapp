$(document).ready(function () {
	
	// define all slides
	var slides = [ 	"news", "twitter", "mensa", "donations", "member"];
	
	// define all feed urls
	var feeds = { 	"infoini_news":"http://www.infoini.de/redmine/projects/fsropen/news.atom", 
					"infoini_status" : "http://www.infoini.de/status.json",
					"mensa" : "http://www.studentenwerk-berlin.de/speiseplan/rss/beuth/tag/lang/0",
					"mensa_ini": "http://infoini.de/mensa.xml",
					"twitter" : ""
	};

	/** CONSTANTS (no magic numbers :) ) **/
	var SLIDE_INTERVAL = 10000;
	var INI_STATUS_INTERVAL = 1000;
	var DEFAULT_STARTING_SLIDE = 0;
	var FEED_UPDATE_INTERVAL = 10000;
	var PAGE_REFRESH_INTEVAL = 10000;
	var ENABLE_SLIDESHOW = true;
	var DEBUG_MODUS = false;
	
	// days of the week
    var weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

	// default coffee level
	var cafe_level = 0;

	/** FEED HANDLER **/
	
	// handle ini status : cafe, time, potentielly door
    var iniStatusHandler = function (data, textStatus) {
        console.log("onSuccess_status");
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
        console.log("onSuccess_news");
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
        console.log("onSuccess Mensa");
		
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

	/** UPDATE FEEDS **/
    var getUpdate = function () {
        console.log('getupdate');
        $.get(feeds.infoini_news, newsHandler);
        $.ajax(feeds.infoini_status, {success: iniStatusHandler, cache: false, ifModified: false});
		$.get(feeds.mensa_ini, mensaHandler);
    };
    getUpdate();
    setInterval(getUpdate, FEED_UPDATE_INTERVAL);
    if(DEBUG_MODUS) setTimeout("location.reload(true);", PAGE_REFRESH_INTEVAL);
	
	/** TWITTER **/
    jQuery(function ($) {
        $("#tweets").tweet({
            query: 'infoini',
            avatar_size: 64,
            count: 5,
            loading_text: "loading tweets...",
            efresh_interval: 30
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

        var time = '[ ' + weekdays[date.getDay()] + ', ' + date.getDate() + '.' + date.getMonth() + 1 + '.' + date.getFullYear() + ' ' + hours + (timeSeparator ? ':' : ' ') + minutes + ' ]';
        timeSeparator = !timeSeparator;
        var cafe = '[ CAFE ' + cafe_level + '%] ';

        $('#date').text(cafe + ' ' + time);
    };
    var timeInterval = setInterval(showStatus, INI_STATUS_INTERVAL);
    showStatus();
	
	/** SLIDES - default hide all, show only one, start with DEFAULT_STARTING_SLIDE **/

	// hide all slides
	var hideAll = function() {
		for(var i = 0; i < slides.length; ++i) {
			$("#"+slides[i]).hide();
		}
	};
	hideAll();

	// show certain slide
	var showSlide = function(pageNumber) {
		// hide all
		hideAll();
		// display slide
		$("#"+slides[pageNumber]).show();
	};
	// start with news
	showSlide(DEFAULT_STARTING_SLIDE);
	
	/** AUTOMATIC SLIDES **/
    var pageCounter = 0;
    var slidePage = function () {
        pageCounter = (pageCounter + 1 ) % slides.length;
		if(ENABLE_SLIDESHOW) showSlide(pageCounter);
    };
    var pageInterval = setInterval(slidePage, SLIDE_INTERVAL);
    //setTimeout(function() { $.scrollTo(pages[2]);},3000);
});
