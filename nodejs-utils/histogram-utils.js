HistogramUtils = {
    convert_to_frequency: function (_attr_list, _csv_file, _cluster_result, _cluster_lables) {
        //console.log(_attr_list);
        var _histogram_data_list = this.histogram_data_list(_attr_list, _csv_file, _cluster_result);
        //console.log(_histogram_data_list);
        var _output_data_set = [];
        for (var _a in _attr_list) {
            var _attr = _attr_list[_a];
            var _histogram_data = _histogram_data_list[_attr];
            
            // ----------------------------------------
            
            var _data_array = [];
            for (var _row in _histogram_data) {
                var _value = _histogram_data[_row]["value"];
                _value = this.parse_number(_value);
                
                _data_array.push(_value);
            }
            //console.log(_data_array);
            var _labels = this.analyze_range_labels(_data_array);
            //console.log(_labels);
            
            // --------------------------------
            var _group_list = {};
            for (var _row in _histogram_data) {
                var _value = _histogram_data[_row]["value"];
                var _group = _histogram_data[_row]["cluster"];
                
                if (typeof(_group_list[_group]) === "undefined") {
                    _group_list[_group] = [];
                }
                _group_list[_group].push(_value);
            }
            
            var _data_set = [];
            var _color_index = 0;
            for (var _i in _cluster_lables) {
                var _group = _cluster_lables[_i];
                //console.log(_group);
                var _data_array = _group_list[_group];
                //console.log(_data_array);
                var _freq_list = this.count_frequency(_data_array, _labels);
                //console.log(_freq_list);
                var _freq_array = [];
                for (var _i in _labels) {
                    var _label = _labels[_i];
                    _freq_array.push(_freq_list[_label]);
                }
                _freq_array.push(0);
                
                var _data_set_item = {
                    backgroundColor: this.get_color(_color_index),
                    data: _freq_array
                };
                
                if (this.parse_number(cfg.chart.legend_display) === true) {
                    _data_set_item["label"] = _group;
                }
                
                _data_set.push(_data_set_item);
                _color_index++;
            }
            
            var _output_data_set_item = {
                //attr: _attr,
                labels: JSON.stringify(this.round_labels(_labels)),
                data_set: JSON.stringify(_data_set)
            };
            
            //console.log(["title display", this.parse_number(cfg.chart.title_display), _attr]);
            if (this.parse_number(cfg.chart.title_display) === true) {
                _output_data_set_item["attr"] = _attr;
            }
            
            _output_data_set.push(_output_data_set_item);
        }
        
        return _output_data_set;
    },
    round_labels: function (_labels) {
        var _round = 0;
        while (true) {
            var _range_labels_clone = JSON.parse(JSON.stringify(_labels));
            _range_labels_clone = this.round_to_precision(_range_labels_clone, _round);
            
            var _match = false;
            for (var _i = 0; _i < _range_labels_clone.length -1; _i++) {
                if (_range_labels_clone[_i] === _range_labels_clone[(_i+1)]) {
                    _match = true;
                    break;
                }
            }
            
            if (_match === false) {
                break;
            }
            else {
                _round++;
            }
        }
        _labels = this.round_to_precision(_labels, _round);
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
        var _split_units = 10;
        var _last_split_units = _split_units;
        var _max_split_units = _split_units + 5;
        var _min_split_units = _split_units - 5;
        var _best_split_units = null;
        var _direction_plus = true;
        var _last_entropy = null;
        
        
        var _last_entropy = this.split_range_labels(_data, _split_units).entropy;
        var _next_entropy = this.split_range_labels(_data, (_split_units+1) ).entropy;
        //console.log(["last next", _last_entropy, _next_entropy]);
        if (_last_entropy < _next_entropy) {
            //_last_entropy = _next_entropy;
            _split_units = _split_units++;
        }
        else {
            _direction_plus = false;
            _split_units--;
        }
        
        while (true) {
            var _range_labels_data = this.split_range_labels(_data, _split_units);
            var _entropy = _range_labels_data.entropy;
            //console.log([_split_units, _entropy, _range_labels_data.labels]);
            if (_last_entropy >= _entropy) {
                _best_split_units = _last_split_units;
                break;
            }
            
            _last_split_units = _split_units;
            if (_direction_plus === true) {
                _split_units++;
                if (_split_units === _max_split_units) {
                    _best_split_units = _last_split_units;
                    break;
                }
            }
            else {
                _split_units--;
                if (_split_units === _min_split_units) {
                    _best_split_units = _last_split_units;
                    break;
                }
            }
        }
        
        var _output = this.split_range_labels(_data, _best_split_units);
        //console.log(_output);
        //console.log("ok");
        return _output.labels;
    },
    split_range_labels: function (_data, _split_units) {
        var _max = Math.max.apply(null, _data);
        var _min = Math.min.apply(null, _data);
        
        //if (_max - _min < _split_units) {
        //    _split_units = _max - _min;
        //}
        
        _split_units--;
        
        var _span = (_max - _min) / _split_units;
        //console.log([_max, _min, _split_units, _span]);
        
        var _range_labels = [];
        for (var _i = 0; _i < _split_units; _i++) {
            var _label = _min + (_i * _span);
            _range_labels.push(_label);
        }
        
        if (_range_labels[_range_labels.length-1] < _max) {
            _range_labels.push(_max);
        }
        else {
            var _label = _min + ((_split_units+1) * _span);
            _range_labels.push(_label);
        }
        //console.log(_range_labels)
        
        // ------------------------
        // 將標籤四捨五入
        /*
        var _round = 0;
        while (true) {
            var _range_labels_clone = JSON.parse(JSON.stringify(_range_labels));
            _range_labels_clone = this.round_to_precision(_range_labels_clone, _round);
            
            var _match = false;
            for (var _i = 0; _i < _range_labels_clone.length -1; _i++) {
                if (_range_labels_clone[_i] === _range_labels_clone[(_i+1)]) {
                    _match = true;
                    break;
                }
            }
            
            if (_match === false) {
                break;
            }
            else {
                _round++;
            }
        }
        _range_labels = this.round_to_precision(_range_labels, _round);
        */
        
        // ------------------
        // 計算這個範圍以內的所有次數
        var _range_labels_count = this.count_frequency(_data, _range_labels);
        //console.log(_range_labels_count);
        
        // ----------------
        // 然後來計算 entropy
        var _entropy= 0;
        for (var _range in _range_labels_count) {
            var _freq = _range_labels_count[_range];
            if (_freq === 0) {
                continue;
            }
            var _prop = _freq / _data.length;
            var _pp = _prop * Math.log(_prop);
            _entropy = _entropy + _pp;
        }
        _entropy = _entropy * -1;
        var _output = {
            entropy: _entropy,
            labels: _range_labels
        };
        
        return _output;
    },
    count_frequency: function (_data, _range_labels) {
        var _max = Math.max.apply(null, _data);
        
        var _range_labels_count = {};
        for (var _i = 0; _i < _range_labels.length; _i++) {
            _range_labels_count[_range_labels[_i]] = 0;
        }
        
        _data.sort();
        //console.log(_data);
        //console.log(_range_labels);
        var _last_range = _range_labels[(_range_labels.length-2)];
        for (var _i in _data) {
            var _value = this.parse_number(_data[_i]);
            var _range = _last_range;
            for (var _r = 0; _r < _range_labels.length - 1; _r++) {
                var _range_start = _range_labels[_r];
                var _range_end = _range_labels[(_r+1)];
                
                if (_value >= _range_start && _value < _range_end) {
                    _range = _range_start;
                    break;
                }
            }
            //console.log([_value, _range]);
            _range_labels_count[_range]++;
        }
        //console.log(_range_labels_count);
        
        return _range_labels_count;
    },
    // https://github.com/google/palette.js/tree/master
    color_list: ['#5DA5DA', '#FAA43A', '#60BD68', '#F17CB0',
                '#B2912F', '#B276B2', '#DECF3F', '#F15854', '#4D4D4D'],
    get_color: function (_index) {
        var _color_list = this.color_list;
        _index = (_index % _color_list.length);
        return _color_list[_index];
    },
    parse_number: function (_str) {
        //console.log([_str, typeof(_str)]);
        if (typeof(_str) === "number") {
            return _str;
        }
        else if (isNaN(_str) === false && (typeof(_str.trim) === "function" && _str.trim() !== "")) {
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
    },
    round_to_precision ($x, $p) {
        if (typeof($x) === "object") {
            for (var _i in $x) {
                $x[_i] = this.round_to_precision($x[_i], $p);
            }
            return $x;
        }
        
        $x = $x * Math.pow(10, $p);
        $x = Math.round($x);
        return $x / Math.pow(10, $p);
    }
};