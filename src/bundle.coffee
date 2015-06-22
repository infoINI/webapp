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

app.directive 'page', ->
  restrict: 'E'
  transclude: true
  templateUrl: 'page.html'
  scope:
    header: '=header'

app.directive 'row', ->
  restrict: 'E'
  transclude: true
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
  .when('/members',
    templateUrl: 'members.html'
    controller: 'MembersCtl'
  )
  .when('/helpers',
    templateUrl: 'helpers.html'
    controller: 'HelpersCtl'
  )
  .when('/donations'
    templateUrl: 'donations.html'
    controller: 'DontationsCtl'
  )
  .when('/news'
    templateUrl: 'news.html'
    controller: 'NewsCtl'
  )
  .when('/mensa'
    templateUrl: 'mensa.html'
  )
  .otherwise('/members')

app.service 'iniAPI', class Api
  constructor: (@$http) ->

  getDonations: ->
    return @donations if @donations
    c = @
    @$http.get('http://infoini.de/api/donations.json').success (res) ->
      c.donations = res.donations

  getMembers: ->
    return @members if @members
    @$http.get('http://infoini.de/api/members.json').success (res) =>
      @members = res.members

  getHelpers: ->
    return @helpers if @helpers
    @$http.get('http://infoini.de/api/helpers.json').success (res) =>
      @helpers = res.members

  getNews: ->
    return @news if @news
    newsUrl = 'http://infoini.de/redmine/projects/fsropen/news.json'
    @$http.get(newsUrl).success (res) =>
      @news = res.news[0]



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


