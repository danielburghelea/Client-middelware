var crypto = require('crypto');
var fs = require('fs');
var os = require('os');
var port = process.env.PORT || 8001;

//app.listen(port, '0.0.0.0');
module.exports = function(app) {

var client = crypto.getDiffieHellman('modp5');
client.generateKeys();
var clientPublic = client.getPublicKey('hex');
var clientSecret = client.getPrivateKey('hex');

app.get('/', function(req, res) {

	fs.readFile('./ClientAuth.html', function (err, html) {
			if (err) {
				throw err; 
			}
		res.write(html);
		res.end('</body></html>');
		});
	console.log("new user");//	
});


app.post('/auth', function(req, res) {
	
	email = req.body.email;
	req.session.email = email;

	res.redirect('/validate');

});


app.get('/validate', isEmail,  function(req, res) {

	//console.log(req.session);
	if(req.session.email == undefined)
		res.redirect('/');
	else{
		var encryptedEmail = encrypt(req.session.email);

		fs.readFile('auth.html', function (err, html) {
				if (err) {
					throw err; 
				}
				res.write(html);
				res.write('<input type="hidden" name="eEmail" value="' + encryptedEmail + '">');
				res.write('<input type="hidden" name="DH1" value="' + clientPublic + '">');
				res.end('</body></html>');
			});
			console.log('email sssss :', req.session.email);
	}
});


app.post('/confirmation', function(req, res) {

	eData = req.body.eDataConfirmation;
	console.log(eData);
	data = decrypt(eData);
	console.log(data);
	
	req.session.host = req.body.host;
	req.session.appVersion = req.body.appVersion;
	req.session.platform = req.body.platform;
	req.session.userAgent = req.body.userAgent;
	req.session.country = req.body.country;
	req.session.city = req.body.city;
	console.log(req.session);
	if (data == "granted"){
	//granted
		res.redirect('/profil');
		
	} else {
	//failed
		res.redirect('/out');
	}
	
});

//========================================
//page for user list
app.get('/profil', isLoggedIn, function(req, res) {
	fs.readFile('profile.html', function (err, html) {
				if (err) {
					throw err; 
				}
		res.write(html);
		res.write( req.session.email
			+ '<hr><h4>This is a demo page containing secured information.</h4>'
			+ '<h4>This page was accesed using only your email from:</h4>'
			+ '<p>Host: ' + req.session.host + '</p>'
			+ '<p>App: ' + req.session.appVersion + '</p>'
			+ '<p>Platform: ' + req.session.platform  + '</p>'
			+ '<p>User-Agent: ' + req.session.userAgent  + '</p>'
			+ '<p>Country: ' + req.session.country  + '</p>'
			+ '<p>City: ' + req.session.city   + '</p>'
			+ '</div>');
		res.end('</body></html>');	
	});
			console.log('email sssss :', req.session.email);
});


//========================================
//page for user list
app.get('/out', isLoggedIn, function(req, res) {
	fs.readFile('out.html', function (err, html) {
				if (err) {
					throw err; 
				}
		res.write(html);
		res.write( req.session.email
			+ '<hr><h4>Here are sensityve information.</h4>'
			+ '<h4>Please let us know who you are</h4>'
			+ '</div>');
		res.end('</body></html>');		
	});
});


app.post('/DHvalidate', function(req, res) {

	pData = req.body.pData;
	sData = req.body.sData;
	
	console.log(pData);
	console.log(sData);
	
	var clientSecretFinal = client.computeSecret(pData, 'hex', 'hex');
	// to be deleted
	console.log(clientSecretFinal==sData);
	console.log("===========================");
	console.log(clientSecretFinal);
	
	if(clientSecretFinal==sData){
		req.session.DH = true;
		res.redirect('/login');
	}

app.get('/login', isLoggedIn, function(req, res) {

	encryptedEmail = encrypt(req.session.email);
	fs.readFile('login.html', function (err, html) {
				if (err) {
					throw err; 
				}
		res.write(html);
		res.write('<input type="hidden" name="eEmail" value="' + encryptedEmail + '">');
		//res.write('<input type="hidden" name="data" value="' + clientPublic + '">');
		res.end('</body></html>');	
	});
});
	
});


}// end of app routing

function decrypt(data) {

	var key = 'buburuze si meduze';
	var decipher = crypto.createDecipher('aes-256-cbc', key);
				
	var decryptedData = decipher.update(data, 'base64', 'utf8');
	decryptedData += decipher.final('utf8');

return decryptedData;
}


function encrypt(data) {

	var key = 'buburuze si meduze';
	var cipher = crypto.createCipher('aes-256-cbc', key);

	var encryptedData = cipher.update(data, 'utf8', 'base64');
	encryptedData += cipher.final('base64');
 
return encryptedData;
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

// if user is authenticated in the session, carry on
	if (req.session.email)
		if(req.session.DH==true)
			return next();

// if they aren't redirect them to the home page
	res.redirect('/');
	return next();
}


// route middleware to make sure
function isEmail(req, res, next) {

// if user is authenticated in the session, carry on
		if (req.session.email != undefined)
			return next();

// if they aren't redirect them to the home page
	res.redirect('/');
	return next();
}