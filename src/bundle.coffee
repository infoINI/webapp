app = angular.module 'iniWebapp', ['ngRoute']

moment = require 'moment'
parser = require 'rss-parser/dist/rss-parser.js'
moment.locale 'de'

require './main.css'
require './donations.html'
require './member.html'
require './members.html'
require './mensa.html'
require './helpers.html'
require './row.html'
require './page.html'
require './news.html'
require './status.html'
require './lh-index.html'

app.directive 'page', ng ->
  restrict: 'E'
  transclude: true
  templateUrl: 'page.html'
  scope:
    header: '=header'

app.directive 'row', ng ->
  restrict: 'E'
  transclude: true
  replace: true
  templateUrl: 'row.html'

app.directive 'member', ng ->
  restrict: 'E'
  templateUrl: 'member.html'
  scope:
    m: '=member'
  controller: ng ($scope, $element) ->
    $scope.toggle = () ->
      $scope.active = !$scope.active

app.config ng ($routeProvider,   $locationProvider) ->
  $routeProvider
  .when('/members'
    templateUrl: 'members.html'
    controller: 'MembersCtl'
    name: 'Mitglieder'
  )
  .when('/helpers'
    templateUrl: 'helpers.html'
    controller: 'HelpersCtl'
    name: 'Helfer'
  )
  #.when('/donations'
  #  templateUrl: 'donations.html'
  #  controller: 'DontationsCtl'
  #  name: 'Spenden'
  #)
  .when('/news'
    templateUrl: 'news.html'
    controller: 'NewsCtl'
    name: 'News'
  )
  .when('/mensa'
    templateUrl: 'mensa.html'
    controller: 'MensaCtl'
    name: 'Mensa'
  )
  #.when('/lh:path*'
  #  templateUrl: 'lh-index.html'
  #  controller: 'LHCtl'
  #  name: 'Lernhilfen'
  #  hideInDemo: true
  #)
  #.when('/lh-upload'
  #  templateUrl: 'lh-upload.html'
  #  controller: 'LHUploadCtl'
  #)
  #.when('/lh-datail'
  #  templateUrl: 'lh-detail.html'
  #  controller: 'LHDetailCtl'
  #)
  .otherwise('/news')

app.filter 'mensaPreisStudent', ng ->
  (str) -> str.substring(4, str.indexOf('/')-1)

app.service 'iniAPI', [ '$http', class Api
  constructor: (@$http) ->

  getDonations: ->
    return @donations if @donations
    c = @
    @$http.get('//infoini.de/api/donations.json').success (res) ->
      c.donations = res.donations

  getMembers: ->
    return @members if @members
    @$http.get('//infoini.de/api/members.json').success (res) =>
      @members = res.members

  getHelpers: ->
    return @helpers if @helpers
    @$http.get('//infoini.de/api/helpers.json').success (res) =>
      @helpers = res.members

  getNews: (cb) ->
    #return cb(@news) if @news
    newsUrl = 'https://infoini.de/rss.xml'
    parser.parseURL(newsUrl, (err, res)=>
      console.log res
      @news = res.feed.entries[0]
      cb(@news)

    )
    #@$http.get(newsUrl).success (res) =>

  getMensa: ->
    #return @mensa if @mensa
    @$http.get('//infoini.de/api/mensa.json').success (res) =>
      @mensa = res

  getStatus: ->
    @$http.get('//infoini.de/api/combined.json').success (res) =>
      @status = res
      @status.pots.map (pot) ->
        pot.level = 0 if not pot.level
      @status.open = 'OPEN' == res.status
]

app.service 'lhAPI', [ '$http', class LhAPI
  constructor: (@$http) ->

  login: (username, password) ->
    data = {
      data:
        username: username
        password: password
    }
    config = {
      headers:
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      transformRequest: (data, headersGetter) ->
        a = []
        for k,v of data.data
          a.push(encodeURIComponent(k) + '=' + encodeURIComponent(v))
        return a.join('&')
    }
    @$http.post('https://infoini.de/api/lh/login', data, config).then( (res) =>
      alert('login ok')
      @getIndex()
    , (err) ->
      alert('login failed')
    )

  getIndex: (path='/') ->
    req = {
      url: 'https://infoini.de/api/lh/list'+ path
      method: 'GET'
    }
    @$http(req).success (res) =>
      @index = res
]

app.controller 'DontationsCtl', ng ($scope, iniAPI) ->
  iniAPI.getDonations()
  $scope.api = iniAPI


app.controller 'MembersCtl', ng ($scope, iniAPI) ->
  iniAPI.getMembers()
  $scope.api = iniAPI

app.controller 'HelpersCtl', ng ($scope, iniAPI) ->
  iniAPI.getHelpers()
  $scope.api = iniAPI

app.controller 'NewsCtl', ng ($scope, $sce, iniAPI) ->
  $scope.api = iniAPI
  iniAPI.getNews (news)->
    $scope.api.news.title =  news.title
    $scope.api.news.content =  $sce.trustAsHtml(news.content)

app.controller 'MensaCtl', ng ($scope, iniAPI) ->
  $scope.api = iniAPI
  iniAPI.getMensa().then ->
    console.log 'got mensa'
    for d, c of iniAPI.mensa
      d = moment.unix parseInt(d, 10)
      # search for todays card first
      if moment().hour() < 14
        if d.isSame(moment(), 'day')
          $scope.content = c
          $scope.date = 'Heute'
          break
      # if it is after 14:00, show next day
      if d.isAfter(moment(), 'day')
        $scope.content = c
        $scope.date = d.format('[Am] dddd, DD.MM.YYYY')
        break

app.controller 'StatusCtl', ng ($scope, iniAPI, $interval) ->
  $scope.api = iniAPI
  iniAPI.getStatus()
  $interval ->
    iniAPI.getStatus()
  , 1000

app.controller 'LHCtl', ng ($scope, $routeParams, lhAPI) ->
  path = $routeParams.path
  console.log 'path', path
  $scope.path = path

  $scope.breadcrumbs = []
  pathParts = path.split '/'
  for p,i in pathParts
    $scope.breadcrumbs.push(
      url: '#lh' + pathParts.slice(0, i+1).join '/'
      name: p
    )
  $scope.lhAPI = lhAPI
  $scope.credentials = {
    username: ''
    password: ''
  }
  $scope.onLogin = ->
    lhAPI.login \
      $scope.credentials.username, $scope.credentials.password

  lhAPI.getIndex(path)

app.controller 'NavCtl', ng ($scope, $route) ->
  $scope.demo = window.location.search == '?demo'
  $scope.routes = $route.routes



$(document).ready ->
  demo = window.location.search == '?demo'

  # scroll through pages if called with ?demo
  if demo
    # hide scrollbars, handle scrolling
    $('body').addClass('demo') #.css('overflow','hidden')

    # hide irelevant content
    $('.noDemo').hide()
    $('.demoOnly').show()
    setTimeout(location.reload, 4*60*60*1000)




  if demo
    # autonav
    navLinks = $('#nav a:visible').get()
    navLinkCurrent = 1
    slide = ->
      navLinks[navLinkCurrent].click()
      #$.scrollTo(navLinks[navLinkCurrent],600);
      navLinkCurrent+=1
      navLinkCurrent%=navLinks.length
    setInterval(slide,20*1000)

  # show store link on android
  if navigator.userAgent.toLowerCase().indexOf("android") > -1
    $('.store_link.android').show()

