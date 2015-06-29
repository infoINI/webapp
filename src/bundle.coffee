app = angular.module 'iniWebapp', ['ngRoute']

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

app.directive 'page', ->
  restrict: 'E'
  transclude: true
  templateUrl: 'page.html'
  scope:
    header: '=header'

app.directive 'row', ->
  restrict: 'E'
  transclude: true
  replace: true
  templateUrl: 'row.html'

app.directive 'member', ->
  restrict: 'E'
  templateUrl: 'member.html'
  scope:
    m: '=member'
  controller: ($scope, $element) ->
    $scope.toggle = () ->
      $scope.active = !$scope.active

app.config ($routeProvider,   $locationProvider) ->
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
  .when('/donations'
    templateUrl: 'donations.html'
    controller: 'DontationsCtl'
    name: 'Spenden'
  )
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
  .otherwise('/news')

app.filter 'mensaPreisStudent', ->
  (str) -> str.substring(4, str.indexOf('/')-1)

app.service 'iniAPI', class Api
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

  getNews: ->
    return @news if @news
    newsUrl = '//infoini.de/redmine/projects/fsropen/news.json'
    @$http.get(newsUrl).success (res) =>
      @news = res.news[0]

  getMensa: ->
    return @mensa if @mensa
    @$http.get('//infoini.de/api/mensa.json').success (res) =>
      @mensa = res

  getStatus: ->
    @$http.get('//infoini.de/api/combined.json').success (res) =>
      @status = res
      @status.pots.map (pot) ->
        pot.level = 0 if not pot.level



app.controller 'DontationsCtl', ($scope, iniAPI) ->
  iniAPI.getDonations()
  $scope.api = iniAPI


app.controller 'MembersCtl', ($scope, iniAPI) ->
  iniAPI.getMembers()
  $scope.api = iniAPI

app.controller 'HelpersCtl', ($scope, iniAPI) ->
  iniAPI.getHelpers()
  $scope.api = iniAPI

app.controller 'NewsCtl', ($scope, iniAPI) ->
  iniAPI.getNews()
  $scope.api = iniAPI

app.controller 'MensaCtl', ($scope, iniAPI) ->
  iniAPI.getMensa()
  $scope.api = iniAPI

app.controller 'StatusCtl', ($scope, iniAPI, $interval) ->
  $scope.api = iniAPI
  iniAPI.getStatus()
  #$interval ->
  #  iniAPI.getStatus()
  #, 1000

app.controller 'NavCtl', ($scope, $route) ->
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

