import http from "http";
import {Server} from "socket.io";

import express from "express";


const app=express();

const httpServer=http.createServer(app);
const wsServer=new Server(httpServer);

app.set("view engine","pug");
app.set("views",__dirname+"/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(_,res)=>res.render("chat"));
app.get("/*",(_,res)=>res.redirect("/"));



function publicRooms(){
	//const sids= wsServer.sockets.adpater.sids;
	//const rooms=wsServer.sockets.adpater.rooms;
	//구조 분해 할당으로 변경
	const {
		sockets:{
			adapter:{sids,rooms},
			},
		}=wsServer;

	const publicRooms=[];
	//rooms의 키 중에서 sids의 어떤 키와도 일치하지 않는 것들만 공용룸으로 push
	rooms.forEach((_,key)=>{
		if(sids.get(key)===undefined){
			publicRooms.push(key)
	}
})
	return publicRooms;
}

function countRoom(roomName){
	//채팅룸이 있는 경우에만 size를 얻기 위해 ? 사용!
	return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}
wsServer.on("connection",(socket)=>{
	socket["nickname"]="Anon";
	socket.on("enter_room",(roomName,done)=>{
		done();
		socket.join(roomName);
		socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName));
		wsServer.sockets.emit("room_change",publicRooms());
	})

	//rooms : 접속 중인 채팅룸 목록을 뜻하는 Set 객체
	socket.on("disconnecting",()=>{
		socket.rooms.forEach(room=>socket.to(room).emit("bye",socket.nickname,countRoom(room)-1));
    });

	socket.on("disconnect",()=>{
		wsServer.sockets.emit("room_change",publicRooms());
    });
	socket.on("new_message",(msg,room,done)=>{
		socket.to(room).emit("new_message",`${socket.nickname}:${msg}`);
		done();
	});
	socket.on("nickname",(nickname)=>(socket["nickname"]=nickname));
    });



const handleListen=()=>console.log("Listenling on http://localhost:2000");
httpServer.listen(2000,handleListen);
