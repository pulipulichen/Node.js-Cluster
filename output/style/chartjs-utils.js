barChartId = 0;
createBarChart = function (_data, _option) {
    //console.log(_data["datasets"]);
    
    var _get_option = function (_key, _default_value) {
        if (typeof(_option[_key]) !== "undefined") {
            return _option[_key];
        }
        else if (typeof(_default_value) !== "undefined") {
            return _default_value;
        }
    };
    
    var _title = _get_option("title");
    var _width = _get_option("width", 400);
    var _height = _get_option("height", 250);
    
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
    
    // -------------------------
    // 判斷是否要使用legend
    var _legend_display = false;
    for (var _group in _data["datasets"]) {
        if (typeof(_data["datasets"][_group]["label"]) === "string" 
                && _data["datasets"][_group]["label"].trim() !== "") {
            _legend_display = true;
            break;
        }
    }
    
    // -------------------
    // 加上次數統計
    
    if (_legend_display === true) {
        for (var _group in _data["datasets"]) {
            var _sum = 0;
            for (var _i in _data["datasets"][_group]["data"]) {
                _sum += parseInt(_data["datasets"][_group]["data"][_i], 10);
            }
            _data["datasets"][_group]["label"] += ": " + _sum;
        }
    } 
    
    // ---------------------
    var _title_display = true;
    
    if (_title === undefined 
            || (typeof(_title) === "string" && _title.trim() === "")) {
        _title_display = false;
    }
    
    // -----------------
    var _id = "barChartId" + barChartId;
    barChartId++;
    var canvas = document.getElementById(_id);
    if (canvas === null) {
        var _div = document.createElement("div");
        _div.style.width = _width + "px";
        _div.style.height = _height + "px";
        document.body.appendChild(_div);
        
        canvas = document.createElement("canvas");
        canvas.id = _id;
        canvas.width = _width;
        canvas.height = _height;
        
        _div.appendChild(canvas);
    }
    
    // ---------------------------
    
    var chart = canvas.getContext('2d');
    var chartObject = new Chart(chart, {
        type: 'bar',
        data: _data,
        maintainAspectRatio: false,
        options: {
            title: {
                display: _title_display,
                text: _title
            },
            legend: {
                display: _legend_display,
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