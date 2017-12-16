KMedoidsNodejs = function (_data) {
    var _result = false;
    var _done = false;

    pyshell = new PythonShell('./python-lib/kmedoids/kmedoids-nodejs.py', {mode:"json"});

    pyshell.send(_data);

    pyshell.on('message', function (message) {
        _result = message;
    });

    // end the input stream and allow the process to exit
    pyshell.end(function (err) {
        if (err){
            throw err;
        };

        //console.log('finished');
        _done = true;
    });

    deasync.loopWhile(function(){return !_done;});

    return _result;
};