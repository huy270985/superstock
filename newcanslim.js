
/**
Depends on jQuery
*/

function render_table(id, rows) {
    console.log('render start');
    var $body = $(id + '>tbody');
    $body.empty();
    for(var i = 0; i < rows.length; i++) {
        $body.append(render_row(rows[i]))
    }
    console.log('render done', $body);
}


function render_row(row) {
    return "<tr>" +
        "<td>" + row.Symbol + "</td>" +
        "<td>" + row.EPS + "</td>" +
        "<td>" + row.LNST + "</td>" +
        "<td>" + row.Score + "</td>" +
            "</tr>";
}

function pipe_to_stock_object(text) {
    var arr = text.split('|');
    return {
        Symbol: arr[0],
        EPS: arr[1],
        LNST: arr[2],
        Score: arr[3],
    }
}

function render_array_to_table_row(text) {
    var arr = text.split('|');
    var res = "<tr>";
    for(var i = 0; i < arr.length; i++) {
        res += "<td>" + arr[i] + "</td>";
    }
    res += "</tr>";
    return res;
}

function render_array_to_table(id, rows) {
    var $body = $(id + '>tbody');
    $body.empty();
    for(var i = 0; i < rows.length; i++) {
        $body.append(render_array_to_table_row(rows[i]))
    }
}

function sync_with_firebase() {
    var ref = new Firebase("https://superstock.firebaseio.com");
    ref.child('longterm_data').on('value', function(data) {
        var obj = data.val();
        var rows = Object.keys(obj).map(function(symbol) {
            return obj[symbol]
        });
        render_array_to_table('#longterm', rows);
    });

    ref.child('shortterm_data').on('value', function(data){
        var obj = data.val();
        var rows = Object.keys(obj).map(function(symbol) {
            return obj[symbol]
        });
        render_array_to_table('#shortterm', rows);
    });
}
