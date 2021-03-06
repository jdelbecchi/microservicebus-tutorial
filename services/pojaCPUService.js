/* Service template for node.js
* Poja testing commit
*
* To use this template, simply add your code in Start and Stop method
*/
var timerEvent; // In case you use a timer for fetching data
var self;
var os = require("os");
var exports = module.exports = {
   // The Start method is called from the Node. This is where you
   // implement your code to fetch the data and submit the message
   // back to the host.
   Start: function () {
       self = this;
       this.Debug("Started");

       timerEvent = setInterval(function () {

           var startMeasure = self.cpuAverage();

           //Set delay for second Measure
           setTimeout(function() {

               //Grab second Measure
               var endMeasure = self.cpuAverage();

               //Calculate the difference in idle and total time between the measures
               var idleDifference = endMeasure.idle - startMeasure.idle;
               var totalDifference = endMeasure.total - startMeasure.total;

               //Calculate the average percentage CPU usage
               var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

               var computer = os.hostname();
               var payload = {
                   percent: percentageCPU,
                   computer: computer,
                   node: self.NodeName,
                   timeStamp: new Date()
               };
               // Submit payload to Node.
               self.SubmitMessage(payload, "application/json", []);
               self.Debug("Submitted reading");


           }, 100);

       }, 3000); // Triggers every three seconds
   },
   // The Stop method is called from the Node when the Node is
   // either stopped or has updated Flows.
   Stop: function () {
       self.Debug('The Stop method is called.');
       // Stop the timerEvent
       clearInterval(timerEvent);
   },
   // The Process method is called from the Node as it receives
   // messages from other services in the same Flow.
   // The [messasge] parameter is a JSON object (the payload)
   // and the [context] parameter is a value/pair object
   // with parameters provided by the hub.
   Process: function (message, context) {},
   cpuAverage: function() {

       //Initialise sum of idle and time of cores and fetch CPU info
       var totalIdle = 0, totalTick = 0;
       var cpus = os.cpus();

       //Loop through CPU cores
       for (var i = 0, len = cpus.length; i < len; i++) {

           //Select CPU core
           var cpu = cpus[i];

           //Total up the time in the cores tick
           for (type in cpu.times) {
               totalTick += cpu.times[type];
           }

           //Total up the idle time of the core
           totalIdle += cpu.times.idle;
       }

       //Return the average Idle and Tick times
       return {
           idle: totalIdle / cpus.length, total: totalTick / cpus.length
       };
   }
}