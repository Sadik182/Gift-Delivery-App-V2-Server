require('dotenv').config();
const express = require('express');
var cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://SadikCQU:BLwQqgA2D1X83Oui@giftdeliverycluster.efrvm.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Global for general use
var userCollection;
var orderCollection;

client.connect(err => {
   userCollection = client.db("giftdelivery").collection("users");
   orderCollection = client.db("giftdelivery").collection("orders");
   
  // perform actions on the collection object
  console.log ('Database up!\n')
 
});


app.get('/', (req, res) => {
  res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})

 
app.get('/getUserDataTest', (req, res) => {

	console.log("GET request received\n"); 

	userCollection.find({}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
			console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});


app.get('/getOrderDataTest', (req, res) => {

	console.log("GET request received\n"); 

	orderCollection.find({},{projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});


app.post('/verifyUser', (req, res) => {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	loginData = req.body;

	userCollection.find({email:loginData.email, password:loginData.password}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
		    console.log(JSON.stringify(docs) + " have been retrieved.\n");
		   	res.status(200).send(docs);
		}	   
		
	  });

});


// Check if the email already exists 
app.post('/checkEmail', (req, res) => {
	console.log("POST request received for checking if email exists: " + JSON.stringify(req.body) + "\n");
	userCollection.findOne({ email: req.body.email }, (err, user) => {
		if (err) {
			console.error("Error checking email: ", err);
			res.status(500).send("Error checking email");
		} else {
			res.status(200).json({ exists: !!user });
		}
	});
});


// Endpoint to handle user signup
app.post('/signup', (req, res) => {
	console.log("POST request received for sign up data : " + JSON.stringify(req.body) + "\n");
	registerData = req.body;
	userCollection.insertOne(registerData, (err, result) => {
		if (err) {
			console.error("Error inserting new user: ", err);
			res.status(500).send("Error inserting new user");
		} else {
			console.log("New user inserted with ID: ", result.insertedId);
			res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
		}
	});

});


app.post('/postOrderData', (req, res) => {
    const newOrder = req.body;

    // Insert the new order into the orders collection in MongoDB
    orderCollection.insertOne(newOrder, (err, result) => {
        if (err) {
            console.error("Error inserting order: ", err);
            res.status(500).send("Error inserting order");
        } else {
            console.log("Order inserted successfully: ", result.insertedId);
            res.status(200).send({ success: true, message: "Order placed successfully", orderId: result.insertedId });
        }
    });
});


app.get('/getCustomerOrders', (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).send({ error: 'Email is required to fetch orders' });
    }

    // Find orders in the 'orders' collection for the given email
    orderCollection.find({ customerEmail: email }).toArray((err, orders) => {
        if (err) {
            console.error("Error fetching orders: ", err);
            return res.status(500).send({ error: 'Error fetching orders' });
        }
        
        // Return the orders found for this user
        res.status(200).send({ data: orders });
    });
});


// Delete Selected Orders

app.delete('/deleteOrders', (req,res) => {
	console.log("Delete request received for : " + JSON.stringify(req.body) + "\n");
	const orderNos = req.body.orderNos;

	if (!Array.isArray(orderNos) || orderNos.length === 0) {
        return res.status(400).send({ error: 'No order numbers provided' });
    }

	orderCollection.deleteMany({ orderNo: { $in: orderNos } }, (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Failed to delete orders' });
        }
        res.send({ deletedCount: result.deletedCount });
    });

});

  
app.listen(port, () => {
  console.log(`Gift Delivery server app listening at http://localhost:${port}`) 
});
