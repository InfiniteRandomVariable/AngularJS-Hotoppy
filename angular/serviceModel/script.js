  angular.
  module('myServiceModule', []).
  controller('MyController', ['$scope', 'notify', 'message',
    function($scope, notify, message) {
      $scope.callNotify = function(msg) {
        notify(msg);
        message.addMessage(msg);
      };
      $scope.messageReturn = function() {
        return message.returnMessage();

      };

      $scope.addMessage = function(msg) {
        message(msg);
      };

    }
  ]).
  factory('notify', ['$window','message',
    function(win, message) {
      var msgs = [];
      return function(msg) {
        msgs.push(msg);
        if (msgs.length == 3) {
          win.alert(msgs.join("\n"));
          msgs = [];
          message.deleteNote();
        }
      };
    }
  ]).
  factory('message', function() {
    var message = {
      msg: '',
      count:0
    };

    return {
      addMessage: function(msg) {
        message.msg = msg;
        message.count = message.count + 1;
        
        //alert('Message: ' + msg);
        //console.log(message.msg);
      },
      returnMessage: function() {
        console.log(message.msg);
        return message;
      },
      deleteNote: function() {
        message = {
          msg: '',
          count:0
        };
      }
    };

  });
