barChartId = 0;
createBarChart = function (_title, _data) {
    //console.log(_data["datasets"]);
    
    // 決定最高值跟step
    var _mix_group = [];
    for (var _group in _data["datasets"]) {
        
        for (var _i in _data["datasets"][_group]["data"]) {
            if (typeof(_mix_group[_i]) !== "number") {
                _mix_group[_i] = 0;
            }
            
            _mix_group[_i] += _data["datasets"][_group]["data"][_i];
        }
    }
    //console.log(_mix_group);
    
    var _first_ceil = function (_num) {
        if (_num === 0) {
            return _num;
        }
        
        var _neg = false;
        if (_num < 0) {
            _neg = true;
            _num = Math.abs(_num);
        } 
        
        var _digit_count = 0;
        while (_num > 10) {
            _num = _num / 10;
            _digit_count++;
        }
        
        _num = Math.ceil(_num) * Math.pow(10, _digit_count);
        
        if (_neg === true) {
            _num = _num * -1;
        }
        
        return _num;
    };
    
    // 判斷區間
    var _min = Math.min.apply(null, _mix_group);
    if (_min > 0) {
        _min = 0;
    }
    _min = _first_ceil(_min);
    
    var _max = Math.max.apply(null, _mix_group);
    
    var _steps = 2;
    var _step_size = _first_ceil((_max - _min) / _steps);
    var _max_value = _min + (_step_size * _steps);
    //console.log([_step_size, _max_value, _min, _max]);
    
    // -----------------
    var _id = "barChartId" + barChartId;
    barChartId++;
    var canvas = document.getElementById(_id);
    if (canvas === null) {
        canvas = document.createElement("canvas");
        canvas.id = _id;
        document.body.appendChild(canvas);
    }
    var chart = canvas.getContext('2d');
    var chartObject = new Chart(chart, {
        type: 'bar',
        data: _data,
        maintainAspectRatio: false,
        options: {
            title: {
                display: true,
                text: _title
            },
            legend: {
                //display: false,
                position: "right",
                labels: {
                    usePointStyle: true
                }
            },
            tooltips: {
                enabled: false, 
            },
            hover: {mode: null},
            responsive: true,
            scales: {
                xAxes: [{
                        stacked: true,
                        categoryPercentage: 1.0,
                        barPercentage: 1.0,
                        gridLines: {
                            stacked: true,
                            offsetGridLines: false,
                            display:false,
                        }
                    }],
                yAxes: [{
                        stacked: true,
                        ticks: {
                            min: _min,
                            max: _max_value,
                            stepSize: _step_size,
                        }
                    }]
            }
        }
    });
};