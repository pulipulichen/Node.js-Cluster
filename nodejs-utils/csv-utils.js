CSVUtils = {
    get_input_files: function (_input_folder_path) {
        var _input_dir = _input_folder_path;
        if (_input_dir.substr(_input_dir.length-1, 1) !== "/") {
            _input_dir += "/";
        }
        console.log(_input_dir);
        var _input_files = fs.readdirSync(_input_dir);

        var _input_files_qualified = [];
        for (var _i = 0; _i < _input_files.length; _i++) {
            var _is_qualified = true;

            var _file_name = _input_files[_i];
            var _last_dot_pos = _file_name.lastIndexOf(".");
            var _ext = _file_name.substring(_last_dot_pos+1, _file_name.length);
            if (_ext !== 'csv') {
                _is_qualified = false;
            }
            
            if (_is_qualified === true) {
                _input_files_qualified.push(path.resolve(_input_dir + _input_files[_i]));
            }
        }
        
        // ===================
        
        var _output_csv = {};
        for (var _i in _input_files_qualified) {
            var _path = _input_files_qualified[_i];
            var _file_name = path.basename(_path, '.csv');
            var _csv_file = fs.readFileSync(_path, 'utf8');
            _csv_file = csv_parse(_csv_file, {columns: true});
            _output_csv[_file_name] = _csv_file;
        }

        return _output_csv;
    },
    convert_csv_to_matrix: function (_csv_file) {
        var _matrix = [];
        for (var _row in _csv_file) {
            var _row_array = [];
            for (var _col in _csv_file[_row]) {
                var _cell = _csv_file[_row][_col];
                _cell = this.parse_number(_cell);
                _row_array.push(_cell);
            }
            _matrix.push(_row_array);
        }
        return _matrix;
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