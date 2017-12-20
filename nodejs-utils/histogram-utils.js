HistogramUtils = {
    convert_to_frequency: function (_attr_list, _csv_file, _cluster_result) {
        var _histogram_data_list = this.histogram_data_list(_attr_list, _csv_file, _cluster_result);
        
        for (var _attr in _histogram_data_list) {
            var _histogram_data = _histogram_data_list[_attr];
            var _data_array = [];
            for (var _row in _histogram_data) {
                var _value = _histogram_data[_row]["value"];
                _value = this.parse_number(_value);
                
                _data_array.push(_value);
            }
            //console.log(_data_array);
            var _labels = this.analyze_range_labels(_data_array);
        }
        
        return _labels;
    },
    histogram_data_list: function (_attr_list, _csv_file, _cluster_result) {
        var _histogram_data_list = {};
        for (var _a in _attr_list) {
            var _attr = _attr_list[_a];
            var _histogram_data = [];
            for (var _row in _csv_file) {
                var _value = _csv_file[_row][_attr];
                var _cluster = _cluster_result[_row];
                _histogram_data.push({
                    value: _value,
                    cluster: _cluster
                });
            }
            _histogram_data_list[_attr] = _histogram_data;
        }
        return _histogram_data_list;
    },
    analyze_range_labels: function (_data) {
        // 最基本的做法，就是切十份然後計算其頻率
        return this.split_range_labels(_data, 10);
    },
    split_range_labels: function (_data, _split_units) {
        var _max = Math.max.apply(null, _data);
        var _min = Math.min.apply(null, _data);
        
        if (_max - _min < _split_units) {
            _split_units = _max - _min;
        }
        
        
        var _span = (_max - _min) / _split_units;
        //console.log([_max, _min, _split_units, _span]);
        
        var _range_labels = [];
        for (var _i = 0; _i < _split_units - 1; _i++) {
            _range_labels.push(_min + (_i * _span));
        }
        _range_labels.push(_max);
        //console.log(_range_labels)
        
        return _range_labels;
        
    },
     parse_number: function (_str) {
        if (isNaN(_str) === false && _str.trim() !== "") {
            var _tmp;
            eval("_tmp = " + _str);
            _str = _tmp;
        }
        else {
            var _boolean = _str.trim().toLowerCase();
            if (_boolean === "true" 
                    || _boolean === "false"
                    || _boolean === "undefined"
                    || _boolean === "null") {
                var _tmp;
                eval("_tmp = " + _boolean);
                _str = _tmp;
            }
        }
        return _str;
    }
};