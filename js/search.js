
$(function () {

    // 模态框注册事件
    $('#myModal').modal('toggle');
    $("#search-btn").click(function () {
        $('#myModal').modal('toggle');
    });

    // 为分页按钮注册事件

    // 为表格获取submit注册事件
    $("#sub-btn").click(function () {
        var key = $("#key").val();
        getAndPushJson(key, 0);
    });

    $("tbody").on('click', 'a', function (event) {
        var itemId = eval(event.target.innerHTML);
        var jsonObj=u.getStorage(itemId);
        console.log(JSON.stringify(jsonObj,null,4));
        $("#modal-body-each").html(JSON.stringify(jsonObj,null,4));
    })
});

// 表格数据ajax
function getAndPushJson(key, page) {
    if(key == ""){
        key="all";
    }
    $.ajax({
        url: "http://172.31.1.110:8089/search/" + key + "/" + page,
        type: "get",
        data: {},
        success: function (data) {
            var content = data.data;
            var pageCount = eval(data.msg);
            insertData(content,page+1,pageCount,key);
        },
        dataType: "json",
        error: function (data) {
            // do nothing
        }
    });
}

function insertData(data,page,pageCount,key) {
    $('#myModal').modal('hide');
    var content = data;
    $('tbody').html("");
    for (var i = 0; i < content.length; i++) {
        var item = content[i];
        u.setStorage(item.id, item);
        $("tbody").append(
            "<tr>" + "<td><a class='forID ' data-toggle=\"modal\" data-target=\"#myModal-1\"> " + item.id + "</a></td>" + "<td>" + item.title
            + "</td>" + "<td>" + new Date(item.startDate) + "</td>"
            + "<td>" + new Date(item.finishDate) + "</td>" + "</tr>");
    }
    // 插入分页

    $('#pages').jqPaginator({
        totalPages: pageCount,
        visiblePages: pageCount>10?10:pageCount,
        currentPage: page,
        onPageChange: function (num, type) {
                if (page === num){
                    return;
                }
                getAndPushJson(key,num-1)
        }
    });


    // 设置当前请求页为.active

    $("#tb-area").removeClass("hidden");


}


function onKeyDown(event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 27) { // 按 Esc
        // do nothing
    }
    if (e && e.keyCode == 13) { // enter 键
        var key = $("#key").val();
        getAndPushJson(key, 0, false);
    }

}

//定义全局变量函数
var uzStorage = function () {
    var ls = window.localStorage;
    return ls;
};
//定义全局变量u
var u = {};
u.setStorage = function (key, value) {
    var v = value;
    if (typeof v == 'object') {
        v = JSON.stringify(v);
        v = 'obj-' + v;
    } else {
        v = 'str-' + v;
    }
    var ls = uzStorage();
    if (ls) {
        ls.setItem(key, v);
    }
};
//获取缓存
u.getStorage = function (key) {
    var ls = uzStorage();
    if (ls) {
        var v = ls.getItem(key);
        if (!v) {
            return;
        }
        if (v.indexOf('obj-') === 0) {
            v = v.slice(4);
            return JSON.parse(v);
        } else if (v.indexOf('str-') === 0) {
            return v.slice(4);
        }
    }
};