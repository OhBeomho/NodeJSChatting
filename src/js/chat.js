"use strict"
const socket = io();
const chatInput = document.querySelector(".message-input"),
	nameInput = document.querySelector(".name-input"),
	messages = document.querySelector(".messages"),
	chatArea = document.querySelector(".chat-area"),
	errorMessage = document.querySelector(".uemessage");
let nickname = "", chatting = false;

chatInput.addEventListener("keypress", (event) => {
	if (event.keyCode == 13) {
		send();
	}
});

function startChat() {
	if (nameInput.value == "") {
		alert("이름을 입력해 주세요.");
		return;
	}

	nickname = nameInput.value;
	socket.emit("username", nickname);
}

function enterChat() {
	let uin = document.querySelector(".usernameinput");
	let chat = document.querySelector(".container");

	uin.setAttribute("style", "display: none;");
	chat.removeAttribute("style");

	socket.on("chatting", (data) => {
		console.log(data.name, data.msg, data.time);

		if (data.name == nickname) {
			myMessage(data.msg, data.time);
		} else {
			message(data.name, data.msg, data.time);
		}

		chatArea.scrollTo(0, chatArea.scrollHeight);		
	});
	socket.on("error", (data) => {
		if (data.name == nickname) {
			alert(data.msg);
		}
	});
}

function serverMessage(msg) {
	let message = new MessageLi("[SERVER]", msg, "none");
	message.makeLi();
}

function message(name, msg, time) {
	let message = new MessageLi(name, msg, time);
	message.makeLi();
}

function myMessage(msg, time) {
	let message = new MessageLi(nickname, msg, time);
	message.makeLi();
}

function send() {
	const data = {
		name: nickname,
		msg: chatInput.value
	};
	
	if (data.msg == "") {
		return;
	}

	socket.emit("chatting", data);
	chatInput.value = "";

	console.log(data);
}

function MessageLi(name, msg, time) {
	this.name = name;
	this.msg = msg;
	this.time = time;
	this.makeLi = () => {
		let li = document.createElement("li");
		let sender = nickname == name ? "me" : "other";

		if (name == "[SERVER]") {
			sender = "server";
			let liContent = `<li class="${sender}">
				<span class="text">
					${msg}
				</span>
			</li>`;
			li.innerHTML = liContent;

			messages.appendChild(li);

			return;
		}

		let liContent = `<li class="${sender}">
			<span class="message">
				<span class="profile">
					<span class="name">
						${name}
					</span>
					<span class="profile-image">
						<img src="https://cdn-icons-png.flaticon.com/512/456/456212.png" width="50" height="50">
					</span>
				</span>
				<span class="content">
					<span class="text">
						${msg}
					</span>
					<span class="time">
						${time}
					</span>
				</span>
			</span>
		</li>`;
		li.innerHTML = liContent;

		messages.appendChild(li);
	}
}

socket.on("uerror", (data) => {
	if (data.name == nickname) {
		errorMessage.innerHTML = data.msg;
	}
});
socket.on("user", (data) => {
	if (data.type == "join" && data.name == nickname) {
		enterChat();
		chatting = true;
	}

	if (chatting) {
		if (data.type == "join") {
			serverMessage(data.name + "님이 들어왔습니다.");
		} else if (data.type == "leave") {
			serverMessage(data.name + "님이 나갔습니다.");
		}
	}
});