

function timeController () {

"use strict";
	  var durationMinsForPub = 30;

	  var self = {};

	  self.dailyMilliSeconds = 24 * 60 * 60 * 1000;
     
      // d1.toUTCString();
      //var time = parseInt(Math.floor(d1.getTime()/ 1000000), 10);

      //30 minutes intervals
      function getTimeUnit(duration, date){

            if (Object.prototype.toString.call(date) === '[object Date]'){
                 return parseInt( date.getTime()/60/1000/duration);       
            }else{
                  return parseInt(new Date().getTime()/60/1000/duration);      
            }
      	
      }

      self.getCurrentPublishingTimeForVersion = function(date){
      	 return getTimeUnit(durationMinsForPub, date);

      };

      self.getDateByHours = function(hours){
      	var date = new Date();

            //start.setTime(end.getTime() - 24 * 60 * 60 * 1000);
      	//date.setHours(date.getHours() + hours);
            date.setTime(date.getTime() + hours * 60 * 60 * 1000); //reminder: always use neutral positive operator as it supports negative number operation.
      	return date;
      };

      self.getCurrentTime = function(){
      	return new Date();
      };

      self.isValidDate = function(d){
            
            if ( Object.prototype.toString.call(d) === "[object Date]" ) {
              // it is a date
                  return true;
                    if ( isNaN( d.getTime() ) ) {  // d.valueOf() could also work
                      // date is not valid
                        return false;
                    }
                    else {
                        return true;
                      // date is valid
                    }
            }
            else {
                  return false;
                    // not a date
            }     
      }

      self.convertVerIntoStartAndEnd = function(ver, obj){

              var start, end;


                if(ver && ver > 1000 && ver < 900000000000){

                  //var roundedVer = obj.ver;
                  var roundedVer = ver + 1;
                  var versionEndTime = parseInt(  roundedVer * 60 * 1000 * 30);
                  console.log('versionEndTime ' + versionEndTime);
                  var end = new Date()
                  end.setTime(versionEndTime);
                  console.log('end ' + end);
                  start = new Date();
                  start.setTime(end.getTime() - 24 * 60 * 60 * 1000);
                 console.log('start ' + start);

                }else{
                  console.log('1 start time ' + obj.start + ' end time ' + obj.end);
                  start  = obj.start ? new Date(obj.start) : getDateByHours(-24);
                  end = obj.end ?  new Date(obj.end) : getCurrentTime();     
                }

                return {start:start, end: end}
      }
      

      return self;

  }


module.exports = new timeController();