const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var admin = require("firebase-admin");
var FCM = require('fcm-node');

var serverKey = 'AAAAWrAAVY0:APA91bGLtc8Ga_nX_MMhsh45dY13pL-Gx4-cxslQX09JmUmMTQ9a7Jk6HOKucrO_K3akmGTD56yWJfNKDEDoffrxccBUJ83psRqVwzwqNAXfyiFY2qRnDYZjnxVyEH4T3C_ePBiKQzuY'; //put your server key here
var fcm = new FCM(serverKey);

var mysql = require('mysql');

var serverKey = require( "./keys/pushnotifications.json" ) //put the generated private key path here    

var fcm = new FCM(serverKey)

//var serviceAccount = require("./keys/pushnotifications.json");

var bodyParser = require('body-parser')

/*admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://nodejspushnotifications.firebaseio.com"
});*/

//GRANT ALL ON devices_tb.* TO 'onegoalnetwork'@'169.60.182.184' IDENTIFIED BY 'TY5X^5fE!bTt8ske' WITH GRANT OPTION;
//GRANT ALL PRIVILEGES ON *.* TO 'onegoalnetwork'@'%'; FLUSH PRIVILEGES;
//GRANT ALL ON notifications_db.* TO onegoalnetwork@'%' IDENTIFIED BY 'TY5X^5fE!bTt8ske' WITH GRANT OPTION; FLUSH PRIVILEGES;
//GRANT ALL ON devices_tb.* TO root@'%' IDENTIFIED BY 'TY5X^5fE!bTt8ske' WITH GRANT OPTION; FLUSH PRIVILEGES;


var con = mysql.createConnection({

	host: "169.60.182.184",
	user: "onegoalnetwork",
	password: "TY5X^5fE!bTt8ske",
	database: "notifications_db"

});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


express()
  	.use(express.static(path.join(__dirname, 'public')))
  	.use( bodyParser.json() )
  	.use(bodyParser.urlencoded({extended: true}))
  	.use(function(req, res, next) {
    	res.header("Access-Control-Allow-Origin", "*");
    	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    	next();
   	})
  	.set('views', path.join(__dirname, 'views'))
  	.set('view engine', 'ejs')
  	.get('/', (req, res) => res.render('pages/index'))
  	.get('/new/device', (req, res) => res.render('pages/new_device'))
  	.get('/new/notification', (req, res) => {
  		//Select all customers and return the result object:
  		var resultArray = [] ;

  		con.query("SELECT * FROM devices_tb", function (err, result, fields) {

    		if (err) throw err;

    		resultArray = Object.values(JSON.parse(JSON.stringify(result))) ;

    		//resultArray.forEach(function(v){ console.log(v.device_token) }) ;

    		res.render('pages/new_notification', {tokens: resultArray}) ;

  		});

  		
  	})
  	.post('/store/device', (req, res) => {

  		var username = req.body.username ;//req.param('username') ;
  		var device_token = req.body.device_token  ;//req.param('device_token') ;

	    var sql = "INSERT INTO devices_tb (username, device_token) VALUES ('"+username+"', '"+device_token+"')" ;
	    con.query(sql, function(err, result) {
	        if (err) 

	        	res.json({ message: ' Failed to add Device ' + username, responce: false }) ;
	        	res.redirect('back');

	        console.log("1 record inserted");

	        res.json({ message: 'Device ' + username + ' created successfully', responce: true }) ;
	        res.redirect('back');
	    });

  	})
  	.post('/send/notification', (req, res) => {

  		var msg = req.body.message ;
  		var device_token = req.body.device_token  ;
	 
	    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
	        to: device_token, 
	        //collapse_key: 'green',
	        
	        notification: {
	            title: 'Arielle Safe', 
	            body: msg 
	        },
	        
	        data: {  //you can send only notification or only data(or include both)
	            my_key: 'my value',
	            my_another_key: 'my another value'
	        }
	    }
	    
	    fcm.send(message, function(err, response){
	        if (err) {
	            console.log("Something has gone wrong!", err)
	        } else {
	            console.log("Successfully sent with response: ", response)
	        }
	    }) ;

		res.redirect('back');

  	})

  	.listen(PORT, () => console.log(`Listening on ${ PORT }`))
