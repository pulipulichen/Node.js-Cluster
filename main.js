require("./require-packages.js");
require("./nodejs-utils/csv-utils.js");
require("./python-lib/shenxudeu-K_Medoids/python-kmedoids.js");

cfg = ini.parseSync('./config.ini');
//console.log(cfg);

var _csv_files = CSVUtils.get_input_files(cfg.csv.input_folder_path);
var _cluster_number = parseInt(cfg.kmedoids.cluster_number, 10);
var _cluster_labels = cfg.kmedoids.cluster_labels.split(",");

for (var _file_name in _csv_files) {
    console.log("Process " + _file_name + "...");
    var _csv_file = _csv_files[_file_name];
    var _matrix = CSVUtils.convert_csv_to_matrix(_csv_file);
    var _attr_list = CSVUtils.get_attr_list(_csv_file);
    //console.log(_matrix);
    
    // 丟到python中
    var _cluster_result = PythonKMedoids(_matrix, _cluster_number);
    console.log(_cluster_result);
    break;
    
    // 輸出檔案
    var _output = [_attr_list.join("&")+"-" + _cluster_number +"-cluster"];
    for (var _i in _cluster_result) {
        var _cluster_number = _cluster_result[_i];
        if (typeof(_cluster_labels[_cluster_number]) !== "undefined") {
            _cluster_number = _cluster_labels[_cluster_number];
        }
        _output.push(_cluster_number);
    }
    
    var _output_path = cfg.csv.output_folder_path + "/" + _file_name + "_cluster.csv";
    fs.writeFileSync(_output_path, _output.join("\n"));
}

console.log("\n=================\n")
console.log("Finish")