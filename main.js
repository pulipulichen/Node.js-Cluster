require("./require-packages.js");
require("./nodejs-utils/csv-utils.js");
require("./python-lib/kmedoids/kmedoids-nodejs.js");

cfg = ini.parseSync('./config.ini');
//console.log(cfg);

var _csv_files = CSVUtils.get_input_files(cfg.csv.input_folder_path);

for (var _file_name in _csv_files) {
    console.log("Process " + _file_name + "...");
    var _csv_file = _csv_files[_file_name];
    var _matrix = CSVUtils.convert_csv_to_matrix(_csv_file);
    //console.log(_matrix);
    
    // 丟到python中
    var _result = PythonKMedoids(_matrix);
    console.log(_result);
}