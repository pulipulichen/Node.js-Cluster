require("./require-packages.js");
require("./nodejs-utils/csv-utils.js");
require("./python-lib/shenxudeu-K_Medoids/python-kmedoids.js");
require("./nodejs-utils/template-utils.js");
require("./nodejs-utils/cache-utils.js");
require("./nodejs-utils/histogram-utils.js");

cfg = ini.parseSync('./config.ini');
//console.log(cfg);

var _csv_files = CSVUtils.get_input_files(cfg.csv.input_folder_path);

var _cluster_labels = cfg.cluster.labels.split(",");
var _cluster_number = _cluster_labels.length;
HistogramUtils.color_list = cfg.chart.color_list.split(",");
        

MainUtils = {
    data: {},
    load_file: function (_file_name) {
        
        //console.log(_matrix);
    },
    cluster_kmedoids: function (_matrix, _cluster_labels, _attr) {
        var _cluster_number = _cluster_labels.length;
        
        var _cache_key_prefix = this.data.file_name;
        if (typeof(_attr) === "string") {
            _cache_key_prefix += "_" + _attr;
        }
        
        var _cluster_result = null;
        if (this.parse_number(cfg.cache.enable) === true) {
            _cluster_result = CacheUtils.get(_cache_key_prefix + "_cluster_result");
        }

        // 丟到python中
        if ( _cluster_result === null ) {
            if (cfg.cluster.algorithm === "kmedoids") {
                //console.log(_matrix);
                _cluster_result = PythonKMedoids(_matrix, _cluster_number);
                
            }

            if (this.parse_number(cfg.cache.enable) === true) {
                CacheUtils.set(_cache_key_prefix + "_cluster_result", _cluster_result);
            }
        }
        //console.log(_cluster_result);
        //break;
        
        // 過濾標籤
        for (var _i in _cluster_result) {
            var _label = _cluster_result[_i];
            if (typeof(_cluster_labels[_label]) !== "undefined") {
                _label = _cluster_labels[_label];
                _cluster_result[_i] = _label;
            }
        }
        
        return _cluster_result;
    },
    write_merge_result: function (_file_name, _attr_list, _cluster_result, _cluster_number) {
        // 輸出檔案
        var _output = [_attr_list.join("&") 
                    + "-" + _cluster_number +"-cluster"];
        for (var _i in _cluster_result) {
            var _cluster_label = _cluster_result[_i];
            _output.push(_cluster_label);
        }

        var _output_path = cfg.csv.output_folder_path + "/" + _file_name 
                + "_" + _cluster_number + "-cluster.csv";
        fs.writeFileSync(_output_path, _output.join("\n"));
    },
    write_seperate_result: function (_file_name, _attr_result, _cluster_number) {
        
        var _attr_list = [];
        var _row_length = null;
        for (var _attr in _attr_result) {
            _attr_list.push(_attr);
            _row_length = _attr_result[_attr].length;
        }
        
        // --------------------------
        
        // 輸出檔案
        var _output = [_attr_list];
        for (var _row = 0; _row < _row_length; _row++) {
            var _row_data = [];
            for (var _attr in _attr_result) {
                _row_data.push(_attr_result[_attr][_row]);
            }
            _output.push(_row_data);
        }

        var _output_path = cfg.csv.output_folder_path + "/" + _file_name 
                + "_" + _cluster_number + "-cluster.csv";
        fs.writeFileSync(_output_path, _output.join("\n"));
    },
    draw_histogram: function (_file_name, _csv_file, _cluster_result, _cluster_labels) {
        var _attr_list = CSVUtils.get_attr_list(_csv_file);
        var _cluster_number = _cluster_labels.length;
        
        // 先來合併資料
        var _histogram_data_list = HistogramUtils
                .convert_to_frequency(_attr_list, _csv_file, _cluster_result, _cluster_labels);
        //console.log(_histogram_data_list);
        var _data = {
            width: cfg.chart.width,
            height: cfg.chart.height,
            attr_data_set: _histogram_data_list
        };
        //console.log(_histogram_data_list);
        //console.log([_histogram_data_list["attr"], typeof(_histogram_data_list["attr"])]);
        //if (typeof(_histogram_data_list["attr"]) !== "undefined") {
        //    _data["title"] = _histogram_data_list.attr;
        //}
        //console.log(_data);
        var _chart_template = TemplateUtils.render("chartjs-barchart/barchart", _data);
        var _chart_output_path = cfg.csv.output_folder_path + "/" + _file_name 
                + "_" + _cluster_number + "-cluster.html";
        fs.writeFileSync(_chart_output_path, _chart_template);
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
    attr_matrix: function (_attr_list, _matrix) {
        var _attr_matrix = {};
        for (var _col = 0; _col < _attr_list.length; _col++) {
            var _attr = _attr_list[_col];
            _attr_matrix[_attr] = [];
            for (var _row in _matrix) {
                var _value = _matrix[_row][_col];
                _attr_matrix[_attr].push([_value]);
            }
        }
        return _attr_matrix;
    }
};

for (var _file_name in _csv_files) {
    
    console.log("Process " + _file_name + "...");
    var _csv_file = _csv_files[_file_name];
    var _matrix = CSVUtils.convert_csv_to_matrix(_csv_file);
    var _attr_list = CSVUtils.get_attr_list(_csv_file);
    
    // --------------------------------
    
    if (MainUtils.parse_number(cfg.cluster.separate) === false) {
        var _cluster_result = MainUtils.cluster_kmedoids(_matrix, _cluster_labels);

        MainUtils.write_merge_result(_file_name, _attr_list, _cluster_result, _cluster_number);

        MainUtils.draw_histogram(_file_name, _csv_file, _cluster_result, _cluster_labels);
    }
    else {
        //console.log(_matrix);
        var _attr_matrix = MainUtils.attr_matrix(_attr_list, _matrix);
        //console.log(_attr_matrix);

        var _attr_result = {};
        for (var _attr in _attr_matrix) {
            _attr_result[_attr] = MainUtils.cluster_kmedoids(_attr_matrix[_attr], _cluster_labels, _attr);
        }
        MainUtils.write_seperate_result(_file_name, _attr_result, _cluster_number);
        
        MainUtils.draw_histogram(_file_name, _csv_file, _attr_result, _cluster_labels);
    }
}   // for (var _file_name in _csv_files) {


console.log("\n=================\n");
console.log("Finish");