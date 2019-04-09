var express = require('express');
// Create an Express App
var app = express();
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

var session = require('express-session');
app.use(session({
	secret: 'keyboardkitteh',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
}))

//////////////MONGOOSE///////////

var mongoose = require('mongoose');
// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/basic_mongoose');

var CatSchema = new mongoose.Schema({
	name: { type: String, required: true, minlength: 3 },
	age: { type: String, required: true, minlength: 3 },
	species: { type: String, required: true, minlength: 3 },
})
mongoose.model('Cat', CatSchema);
// Retrieve the Schema called 'User' and store it to the variable User
var Cat  = mongoose.model('Cat');

mongoose.Promise = global.Promise;

const flash = require('express-flash');
app.use(flash());


////////////////rendering the home page//////////////

app.get('/', function (req, res) {
	// This is where we will retrieve the quotes from the database and include them in the view page we will be rendering.
	Cat.find({}, function (err, cat) {
		if (err) {
			res.render('index', { err })
		} else {
			res.render('index', { 'cats': cat });
		}
	})
})

////////////// rendering new page/////////////////

app.get('/new', function (req, res) {
	res.render('new', {})
})

///////////////////method to add cat/////////////////

app.post('/create', function (req, res) {
	console.log("POST DATA", req.body);
	var cat = new Cat({ name: req.body.name, species: req.body.species, age: req.body.age });
	cat.save(function (err) {
		if (err) {
			// if there is an error upon saving, use console.log to see what is in the err object 
			console.log("We have an error!", err);
			// adjust the code below as needed to create a flash message with the tag and content you would like
			for (var key in err.errors) {
				req.flash('registration', err.errors[key].message);
			}
			// redirect the user to an appropriate route
			res.redirect('/new');
		}
		else {
			res.redirect('/');
		}
	});
})

///////////////click to name of pet////////////

app.get('/show/:id', function (req, res) {
	console.log(req.params)
	Cat.find({_id: req.params.id}, function(err, cat){
        console.log(cat);
        res.render('show', {'cat': cat});
    });
});


///////////////////rendering edit page////////////////

app.get('/edit/:id', function (req, res) {
	console.log(req.params.id)
	Cat.find({ _id: req.params.id }, function (err, cat) {
		console.log(cat);
		res.render('edit', {'cat': cat });
	})
})

////////////////////edit method///////////

app.post('/update/:id', function (req, res) {
	console.log(req.params)
	Cat.update({_id: req.params.id}, {$set: {name: req.body.name, species: req.body.species, age: req.body.age}}, function(err, cat){
        if(err){
            console.log("We have an error!", err);
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.render('edit', {'cat': cat} );
        }
        else {
            res.redirect('/');
        }
    });
});

////////////////////delete method///////////

app.post('/delete/:id', function (req, res) {
	console.log(req.params)
	Cat.deleteOne({_id: req.params.id}, function(err, cat){
		res.redirect('/');
})
})



app.listen(8000, function () {
	console.log("listening on port 8000");
})