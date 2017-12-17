PythonPAM = function (_matrix, _k) {
    
    var _attr_max = {};
    var _attr_min = {};
    for (var _row_i in _matrix) {
        for (var _col_i in _matrix[_row_i]) {
            var _cell = _matrix[_row_i][_col_i];
            
            if (typeof(_attr_max[_col_i]) === "undefined") {
                _attr_max[_col_i] = _cell;
                _attr_min[_col_i] = _cell;
            }
            else {
                _attr_max[_col_i] = Math.max(_cell, _attr_max[_col_i]);
                _attr_min[_col_i] = Math.min(_cell, _attr_min[_col_i]);
            }
        }
    }
    
    for (var _row_i in _matrix) {
        for (var _col_i in _matrix[_row_i]) {
            var _cell = _matrix[_row_i][_col_i];
            var _norm_cell = (_cell - _attr_min[_col_i]) / (_attr_max[_col_i] - _attr_min[_col_i]);
            _matrix[_row_i][_col_i] = _norm_cell;
        }
    }
    
    // -----------------------
    
    var _data = {
        matrix: _matrix,
        k: 3
    };
    
    // --------------------
    
    var _result = false;
    var _done = false;
    
    
    var pyshell = new PythonShell('./python-lib/pycluster/python-pam.py', {mode:"json"});

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

    // ------------------------
    // 後置處理
    
    
    var _array_avg = function (_array) {
        var _sum = 0;
        for (var _i in _array) {
            _sum += _array[_i];
        }
        return _sum / _array.length;
    };
    
    // 先取出中心點列表
    var _medoids_list = [];
    for (var _m in _result) {
        var _m_array = _matrix[parseInt(_m, 10)];
        var _m_avg = _array_avg(_m_array);
        _medoids_list.push({
            m: _m,
            avg: _m_avg
        });
        console.log(_m_array);
    }
    
    var _sorted = _medoids_list.slice().sort(function(a,b){return a.avg-b.avg});
    var _ranks = _medoids_list.slice().map(function(v){ return _sorted.indexOf(v)+1; });
    
    var _medoids_dict = {};
    for (var _i = 0; _i < _medoids_list.length; _i++) {
        var _rank = _ranks[_i];
        var _m = _medoids_list[_i].m;
        _medoids_dict[_m] = _rank;
    }
    
    _result = _medoids_dict;

    return _result;
};