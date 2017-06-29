var express = require('express');
var app = express();
app.use(express.static("./pulic"));
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3705);

var mangUsersOnline = [];


io.on("connection", function(socket){
    console.log("co ng vua ket noi, socket id la:" + socket.id);
    //tao room
    socket.on("tao-room", function(data){
        socket.join(data);
        socket.Phong = data;
        var mang= [];
        for(r in socket.adapter.rooms){
            mang.push(r);
        }
        socket.emit("server-send-rooms", mang);
        socket.emit("server-send-room-socket", data);
        io.sockets.emit("server-send-danh-sach-users", mangUsersOnline);
    });
    //tao user
    socket.on("client_gui_username", function(data){
        console.log("Co ng dang ki vs username la:" + data);
        if(mangUsersOnline.indexOf(data)>=0){
            //dki that bai
            socket.emit("server-send-dang-ki-that-bai", data);
        }else{ //dki thanh cong
            mangUsersOnline.push(data);
            socket.Username = data;
            socket.emit("server-send-dang-ki-thanh-cong", {username:data, id:socket.id});
            //io.sockets.emit("server-send-danh-sach-users", mangUsersOnline);
        }
    });

    socket.on("Logout", function(){
        mangUsersOnline.splice(mangUsersOnline.indexOf(socket.username), 1);
        socket.broadcast.emit("server-send-danh-sach-users", mangUsersOnline);
    });

    socket.on("client_gui_message", function(data){
        io.sockets.in(socket.Phong).emit("server_gui_message", {Username:socket.Username, msg:data});
    });

    socket.on("toi-dang-go-chu", function(){
        var s = socket.Username + " dang go chu....";
        io.sockets.emit("ai-do-dang-go-chu", s);
    });

     socket.on("toi-ngung-go-chu", function(){
        var s = socket.Username + " da ngung chu";
        io.sockets.emit("ai-do-ngung-go-chu", s);
    });
    
    socket.on("user-choc-gheo-socketid-khac", function(data){
        io.to(data).emit("server-xu-li-choc-gheo", socket.Username);
    });
});

app.get("/", function(req, res) {
    res.render("index");
});