// logger.js
var bunyan = require('bunyan');
// bunyan.createLogger(options)

var log = bunyan.createLogger({name: 'server', 
	serializers:{err: bunyan.stdSerializers.err},
	streams: [
        {
            type: 'rotating-file',
            path: './log/info.log',
            level: 'info',
            period: '1d',   // daily rotation
        	count: 5
        },
         {
            type: 'rotating-file',
            path: './log/error.log',
            level: 'error',
            period: '1d',   // daily rotation
        	count: 5     
        }


        ]

        });

module.exports = function logger(){


	  function _info(msg){
    	log.info(msg);
     //   console.log("writing to " + streams.path);
    };

    function _error(msg){

     	log.error({err: msg});
       // console.log("ERROR " + streams.path);

    };


    function _warn (msg){

    	log.warn({err: msg});
    };

    return {
    		info: _info,
    		error: _error,
    		warn: _warn
    	}



};