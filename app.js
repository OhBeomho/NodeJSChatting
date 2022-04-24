const express = require("express");
const socketIO = require("socket.io");
const moment = require("moment");
const http = require("http");
const path = require("path");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, "src")));

const serverName = "[SERVER]";
const users = [ serverName ];

io.on("connection", (socket) => {
	let cname = "";

	socket.on("chatting", (data) => {
		const { name, msg } = data;
		io.emit("chatting", {
			name: name,
			msg: msg,
			time: moment(new Date()).format("A h:mm")
		});
	});
	socket.on("username", (name) => {
		if (users.includes(name)) {
			io.emit("uerror", {
				name,
				msg: "이미 존재하는 사용자명입니다."
			});
			return;
		} else {
			users.push(name);
			io.emit("user", {
				name,
				type: "join"
			});
			cname = name;
		}
	});
	socket.on("disconnect", () => {
		if (cname != "") {
			users.splice(users.indexOf(cname), 1);
			io.emit("user", {
				name: cname,
				type: "leave"
			});
		}
	});
});

server.listen(PORT, () => {
	console.log("Server started: 'localhost:" + PORT + "'");
});