const io = require("socket.io-client");

export default function () {
    const socket = io.connect("http://localhost:4000");

    function registerHandler(onMessageReceived) {
        socket.on("message", onMessageReceived);
    }

    function unregisterHandler() {
        socket.off("message");
    }

    function lockHero(name, cb) {
        socket.emit("lockHero", name, cb);
    }

    function join(locationName, cb) {
        socket.emit("join", locationName, cb);
    }

    function leave(locationName, cb) {
        socket.emit("leave", locationName, cb);
    }

    function message(locationName, msg, cb) {
        socket.emit("message", { locationName, message: msg }, cb);
    }

    function getLocation(cb) {
        socket.emit("location", null, cb);
    }

    function getAvailableUsers(cb) {
        socket.emit("availableHero", null, cb);
    }

    socket.on("error", function (err) {
        console.log("received socket error:");
        console.log(err);
    });

    return {
        lockHero,
        join,
        leave,
        message,
        getLocation,
        getAvailableUsers,
        registerHandler,
        unregisterHandler
    };
}