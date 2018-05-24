$(function () {
    //login
    $("#login-form button").click(function () {
        login();
    });
    // 标签事件
    $("#myTab a").click(function (e) {
        e.preventDefault();
        $('#myTab li').removeClass('active');
        $(e.target).parent().addClass('active');
        var content = $(e.target).html();
        //发出后台请求
        if ("Users" == content) {
            getUserInfo();
        } else if (content == "Settings") {
            getNotes();
        } else if (content === "Tools"){
            getServiceStatus(document.getElementById("PFGold-btn"),"PFGoldAutoTriage");
            getServiceStatus(document.getElementById("WARM-btn"),"WARMAutoReply");
        }
        $(this).tab('show');
    });

    // +User
    $("#addUser-btn").click(function () {
        $("#addUser").toggleClass("hidden");
    });
    $('#addUser button').click(function () {
        postNewUser();
    });
    $("#add-msg button").click(function () {
        postMsg();
    });

});

function postMsg() {
    $.ajax({
        url: "http://172.31.1.110:8089/note/add",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        type: "post",
        data: $('#add-msg').serialize(),
        success: function (data) {

            if (data.code !== 200) {
                $("#note-table tbody").html("Unauthorized, please login correctly first!");
                alert("failed : " + data.msg);
                return;
            }
            $("#add-msg input").val("");
            alert("succeeded.");
            getNotes();
        },
        error: function (data) {
            alert("failed:" + data.msg);
        }
    });
}

function postNewUser() {
    $.ajax({
        url: "http://172.31.1.110:8089/user/add",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        type: "post",
        data: $('#addUser').serialize(),
        success: function (data) {
            $("#addUser").toggleClass("hidden");
            if (data.code == 110) {
                $("#user-table tbody").html("Unauthorized, please login correctly first!");
                alert("failed : " + data.msg);
                return;
            }
            alert("succeeded.");
            $("#addUser input").val("");
            getUserInfo();

        },
        error: function (data) {
            alert("failed:" + data.msg);
        }
    });
}

function getNotes() {
    $.ajax({
        url: "http://172.31.1.110:8089/note/notes",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        type: "get",
        success: function (data) {
            if (data.code != 200) {
                alert("Failed : " + data.msg)
                return;
            }
            insertNotes(data.data)
        },
        dataType: "json",
        error: function (data) {
            // do nothing
        }
    });
}

function insertNotes(data) {
    var items = data;
    if (items == null) return;
    var table = $("#note-table tbody");
    table.html("");
    for (var i = 1; i <= items.length; i++) {
        var item = items[i - 1];
        table.append(
            "<tr>" + "<td>" + i + "</a></td>" + "<td>" + item.description
            + "</td>" + "<td>" + (new Date(item.createdDate)).toLocaleString() + "</td>"
            + "<td>" + (new Date(item.expiredDate)).toLocaleString() + "</td>" + "</tr>");
    }
}

function getUserInfo() {
    $.ajax({
        url: "http://172.31.1.110:8089/user/users",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        type: "get",
        success: function (data) {
            if (data.code != 200) {
                alert("Failed : " + data.msg)
                return;
            }
            insertUserInfo(data.data)
        },
        dataType: "json",
        error: function (data) {
            // do nothing
        }
    });
}


function insertUserInfo(data) {
    var items = data;
    if (items == null) return;
    var table = $("#user-table tbody");
    table.html("");
    for (var i = 1; i <= items.length; i++) {
        var item = items[i - 1];
        table.append(
            "<tr>" + "<td>" + i + "</a></td>" + "<td>" + item.username
            + "</td>" + "<td>" + item.role + "</td>"
            + "<td>" + "<a class='btn btn-light'><span class='glyphicon glyphicon-pencil'></span></a>" + "</td>" + "</tr>");
    }
}

function login() {
    $.ajax({
        url: "http://172.31.1.110:8089/user/login",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        type: "post",
        data: $('#login-form').serialize(),
        success: function (data) {
            var status = data.code;
            if (status !== 200) {
                $("#home").html("<h3>Login Failed!</h3><br>" +
                    "<a class='btn btn-primary' onclick='location.reload()'>re-login</a>")
            } else {
                $("#home").html("<h3>Successfully Logged in.<br>You can go on with next parts.</h3>");
            }
        },
        dataType: "json",
        error: function (data) {
            // do nothing
        }
    })
}


function onKeyDown(event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 27) { // 按 Esc
        // do nothing
    }
    if (e && e.keyCode == 13) { // enter 键

        $(e.target).parents(" form").find("button").click();
    }

}

function runUtils(e, name) {
    $.ajax({
        url: "http://172.31.1.110:8089/utils/run",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        type: "post",
        data: {"script": name},
        success: function (data) {
            var status = data.code;
            if (status !== 200) {
                alert("not allowed!")
                return
            } else {
                var msg = data.data;
                if (msg !== "Execution Success!") {
                    $(e.target).after(
                        "<div style='color: #ff4532'>REQUEST HANDLED<br>DETAILS: "
                        + data.data +
                        "<br>NOTE: There may be some exception in script.</div>");
                } else {
                    $(e.target).after(
                        "<div  style='color: #b2a7ff'>REQUEST HANDLED<br>DETAILS: "
                        + data.data + "<br>Please Check Your Outlook Inbox</div>");
                }
            }
        },
        dataType: "json",
        error: function (data) {
            // do nothing
        }
    })
}
function getServiceStatus(e, name) {
    $.ajax({
        url: "http://172.31.1.110:8089/utils/servicestatus",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        type: "post",
        data: {"script": name},
        success: function (data) {
            var status = data.code;
            var msg=data.data;
            if (status === 110) {
                alert("Unauthorized!");
                return;
            } else if(name === "PFGoldAutoTriage" && status === 200){
                if(msg === 1)
                    $("#pfgold-img").attr("src","on.gif");
                if(msg === 0)
                    $("#pfgold-img").attr("src","off.gif");
            }
            else if(name === "WARMAutoReply" && status === 200){
                if(msg === 1)
                    $("#warm-img").attr("src","on.gif");
                if(msg === 0)
                    $("#warm-img").attr("src","off.gif");
            }
        },
        dataType: "json",
        error: function (data) {
            // do nothing
        }
    })
}
function startService(e, name) {
    $.ajax({
        url: "http://172.31.1.110:8089/utils/servicestart",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        type: "post",
        data: {"service": name},
        success: function (data) {
            var status = data.code;
            var msg=data.data;
            if (status === 110) {
                alert("not allowed!");
                return;
            }else  if(status = 200 && msg==="Already Started By Other Person!"){
                alert(msg);
                return
            } else{

                $(e.target).next().attr("src","on.gif");

            }
        },
        dataType: "json",
        error: function (data) {
            // do nothing
        }
    })
}