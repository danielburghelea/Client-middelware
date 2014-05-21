exports.LoginForm = function(res, fs){ // login form
	res.writeHead(200, { 'Content-Type': 'text/html' });

	fs.readFile('./Clientindex.html', function (err, html) {
		if (err) {
			throw err; 
		}
	res.write(html);
	res.end();
	});
};