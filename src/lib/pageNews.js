var React = require('react');
var Page = require('./page.js');
var LinkMore = require('./linkMore.js');


var PageNews = React.createClass({
    render: function () {
        return this.transferPropsTo(Page(
            null,
            this.renderNews(),
            React.DOM.div(
                { className: 'row alt noDemo' },
                LinkMore({link: '//infoini.de/redmine/projects/fsropen/news', text: 'Alle News' })
            )
        ));
    },
    getInitialState: function () {
        return {
            items: null
        };
    },
    getDefaultProps: function () {
        return {
            id: 'news',
            pageTitle: 'News'
        };
    },
    componentDidMount: function () {
        this.getNews();
    },
    getNews: function () {
        $.get('//infoini.de/redmine/projects/fsropen/news.atom',{}, this.parseNews);
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
            /*jslint nomen: true */
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


module.exports = PageNews;
