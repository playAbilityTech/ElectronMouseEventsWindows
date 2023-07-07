const { spawn } = require('child_process');
const fs = require('original-fs');
const path = require('path');

const executablePath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@olympicangel', 'mouse-events', 'bin', 'MiceDetect.exe');

if (fs.existsSync(executablePath)) {
    var child = spawn(executablePath);

    child.stdout.on('data', HandleBinaryOutput);

    function HandleBinaryOutput(data) {
        data = data.toString().trim(); // normalize output
        data = data.replace(/'/g, '"');
        let miceData;
        try {
            miceData = JSON.parse(data); // convert string output into JSON e.g. {action:"move",cords:[0,0]}
        } catch (e) {
            return console.log("error: " + e + "\n" + data);
        }

        // handles all events callback
        events.any.forEach((cb) => {
            cb(miceData);
        });

        // handles specific event callback
        const eventCB_arr = events[miceData.action] || [];
        if (!eventCB_arr)
            return;
        eventCB_arr.forEach((cb) => {
            cb(miceData);
        });
    }
} else {
    console.error('Could not find MiceDetect.exe at path:', executablePath);
}

const events = {
    move: [],
    left_down: [],
    left_up: [],
    right_down: [],
    right_up: [],
    wheel: [],
    any: []
};

module.exports = {
    /**
     * Register mouse event
     * @param {('move'|'left_down'|'left_up'|'right_down'|'right_up'|'wheel'|'any')} event_name - events of mouse
     * @param {Function} cb function to trigger once events fires
     */
    on(event_name, cb) {
        if (!(cb instanceof Function))
            throw new Error("Undefined callback function! only function accepted..");

        let possibleEvents = Object.keys(events);
        if (possibleEvents.indexOf(event_name) == -1)
            throw new Error("Undefined event passed: '" + event_name + "'.\nPlease provide one of the following events: " + possibleEvents.join(", ") + ".");

        events[event_name].push(cb);
    },

    /**
     * removes mouse event
     * @param {('move'|'left_down'|'left_up'|'right_down'|'right_up'|'wheel'|'any')} event_name - events of mouse
     * @param {Function} cb function to trigger once events fires
     */
    remove(event_name, cb) {
        if (!(cb instanceof Function))
            throw new Error("Undefined callback function! only function accepted..");

        let possibleEvents = Object.keys(events);
        if (possibleEvents.indexOf(event_name) == -1)
            throw new Error("Undefined event passed: '" + event_name + "'.\nPlease provide one of the following events: " + possibleEvents.join(", ") + ".");

        let func_index = events[event_name].indexOf(cb);
        if (func_index == -1)
            return new Error("This function is not registered in that event..");

        events[event_name].splice(func_index, 1);
    }
}
