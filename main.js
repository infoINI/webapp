
var cafe_level = 0;
$(document).ready(function() {
        var onSuccess_status = function(data,textStatus) {
                console.log("onSuccess_status");
                //console.log(data);
                //console.log(data.cafepots);
                //$('.tuer').text(data.tuer_offen?'offen':'geschlossen');
                var kanne1_lvl =  data.cafepots[0].level;
                var kanne1_text = data.cafepots[0].status;
		var kanne1_height = 0;
                if(kanne1_lvl) {
                    //$('#pot1_text').text(kanne1_lvl+'%');
                } else {
                    //$('#pot1_text').text(kanne1_text);
					kanne1_lvl=0;
                }
		//$('#pot1_level').stop().animate({'height':kanne1_lvl+'%'});
		cafe_level = kanne1_lvl;
        };

        var onSuccess_news = function(data,textStatus) {
                console.log("onSuccess_news");
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
                //console.log(items);

                $('#news').html('');
                for(var i in items) {
                    var title = '<h3>'+items[i].title+'</h3>';
                    var content = '<p>'+items[i].content+'</p>';
		    var newsitem = '<div>'+title + content+'</div>';
                    $('#news').append(newsitem);
                    if(i==0) break;
                }


        };

        var getUpdate = function() {
	    console.log('getupdate');
            $.get('/redmine/projects/fsropen/news.atom',{}, onSuccess_news);
            $.ajax('/status.json',{success:onSuccess_status,cache:false,ifModified:false} );
        };
        getUpdate();
        setInterval(getUpdate,10000);
	setTimeout("location.reload(true);",100000); 

    jQuery(function($){
        $("#tweets").tweet({
	    query:'infoini',
            avatar_size: 64,
            count: 5,
            loading_text: "loading tweets...",
	    efresh_interval: 30
        });
    });

    var timeSeparator = false;
    var weekdays = ['So','Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    var showStatus = function() {
	// time
	var date = new Date();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	hours = hours<10?'0'+hours:''+hours;
	minutes = minutes<10?'0'+minutes:''+minutes;

	var time = '[ '+weekdays[date.getDay()] +', '+date.getDate()+'.'+date.getMonth()+1+'.'+date.getFullYear()+' '   +hours+ (timeSeparator?':':' ') +minutes+' ]';
	timeSeparator = !timeSeparator;
	var cafe = '[ CAFE '+cafe_level+'%] ';

	$('#date').text(cafe+' '+time);
    };
    var timeInterval = setInterval(showStatus,1000);
    showStatus();

    var pageCounter = 0;
    var pages = $('.page').get();
    var slidePage = function() {
	var page = pages[pageCounter];
	pageCounter = (pageCounter+1)%pages.length;
	$.scrollTo(page);
    };
    var pageInterval = setInterval(slidePage,15000);
    slidePage();
    //setTimeout(function() { $.scrollTo(pages[2]);},3000);
});
