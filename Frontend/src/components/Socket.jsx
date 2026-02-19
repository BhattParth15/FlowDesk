import { io } from "socket.io-client";

const socket = io("http://localhost:9824", {withCredentials: true});

export default socket;
