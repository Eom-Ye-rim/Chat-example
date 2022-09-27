const socket = io(); // socket.io를 설치하고 나면 io 함수 사용 가능

const welcome=document.getElementById("welcome");
const form=welcome.querySelector("form");
const room=document.getElementById("room");

room.hidden=true;

let roomName;

function addMessage(message){
	const ul=room.querySelector("ul");
	const li=document.createElement("li");
	li.innerText=message;
	ul.appendChild(li);
}

function handleMessageSubmit(event){
	event.preventDefault();
	const input=room.querySelector("#msg input");
	const value=input.value;
	socket.emit("new_message",value,roomName,()=>{
		addMessage(`you : ${value}`);
	});
	input.value="";
}


function handleNickNameSubmit(event){
	event.preventDefault();
	const input=room.querySelector("#name input");
	const value=input.value;
	console.log(`${value}`);
	socket.emit("nickname",value);
	input.value="";
}

function showRoom(){
	welcome.hidden=true;
	room.hidden=false;
	const h3=room.querySelector("h3");
    h3.innerText=`Room ${roomName}`;
	const msgForm=room.querySelector('#msg');
	const nameForm=room.querySelector("#name");
	msgForm.addEventListener("submit",handleMessageSubmit);
	nameForm.addEventListener("submit",handleNickNameSubmit);
}


function handleRoomSubmit(event){
	event.preventDefault();
	const input=form.querySelector("input");
	socket.emit("enter_room",input.value,showRoom);
	roomName=input.value;
	input.value="";
}


form.addEventListener("submit",handleRoomSubmit);

socket.on("welcome",(userNickname,newCount)=>{
	const h3=room.querySelector("h3");
	h3.innerText=`Room ${roomName} (${newCount})`;
	addMessage(`${userNickname} arrived!`);
});

socket.on("bye",(userNickname,newCount)=>{
	const h3=room.querySelector("h3");
	h3.innerText=`Room ${roomName} (${newCount})`;
	addMessage(`${userNickname} left ㅠㅠ`);
});


socket.on("new_message",(msg)=>{
	addMessage(msg);
});
    
socket.on("room_change",(rooms)=>{
	const roomList=welcome.querySelector("ul");
	roomList.innerHTML=""; //ul 내부에 있던 기존 내용을 삭제시켜줌, room_change 이벤트를 처리할 때마다 채팅룸 목록을 화면에 새로 표시해야하므로!
	
	if(rooms.length ===0){
		return;
	}
	rooms.forEach((room)=>{
		const li= document.createElement("li");
		li.innerText=room;
		roomList.append(li);

	});
});