const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var admin = require("firebase-admin");

var mysql = require('mysql');

var serviceAccount = require("./keys/firebase_db.json");

var bodyParser = require('body-parser')

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://nodejspushnotifications.firebaseio.com"
});

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
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/new/device', (req, res) => res.render('pages/new_device'))
  .post('/store/device', (req, res) => {

  		var username = req.body.username ;//req.param('username') ;
  		var device_token = req.body.device_token  ;//req.param('device_token') ;

		con.connect(function(err) {

/*		    if (err) 
		    	res.json({ message: ' Failed to connect to server ', responce: false, error: err }) ;*/

		    console.log("Connected!");
		    var sql = "INSERT INTO devices_tb (username, device_token) VALUES ('"+username+"', '"+device_token+"')" ;
		    con.query(sql, function(err, result) {
		        if (err) 

		        	res.json({ message: ' Failed to add Device ' + username, responce: false }) ;

		        console.log("1 record inserted");

		        res.json({ message: 'Device ' + username + ' created successfully', responce: true }) ;
		    });
		});

  })

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
