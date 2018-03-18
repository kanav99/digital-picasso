var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var mv = require('mv');
const path = require('path');
var fileUpload = require('express-fileupload');
var { spawn } = require('child_process');
var mailer = require('nodemailer');
var chokidar = require('chokidar');
const DataURI = require('datauri');

const imageDataURI = require("image-data-uri");

let domain = "sandboxf06b3248155147e895cbdbd6c994bc4c.mailgun.org";
let api_key = "key-42bc7e97621dcd832562f0fc4b3d617e";
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});


/** MEREKO KO MAIL TO AA RHA THA ISSE */
/** EK BAAR TRY KAR LENA */
/** Chrome me log in karke rakha hua hai */
/*let mail = {
		from: 'SDSLabs <srishti@sdslabs-18.co>',
		to: "deepeshpathak09@gmail.com",
		subject: 'Picasso Doodle',
		text: 'Picasso Doodle for Srishti - 18'
	}

	mailgun.messages().send(mail, function (error, body) {
	  console.log(body);
	});*/

var transporter = mailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: 'kanav.proj@gmail.com',
		pass: 'hellohello'
	}
});

/*let mail = {
			from: 'SDSLabs <srishti@sdslabs-18.co>',
			to: 'asupalai@gmail.com',
			subject: 'Picasso Doodle',
			text: 'Picasso Doodle for Srishti - 18 -test palai',
			
		};

		mailgun.messages().send(mail, function (error, body) {
		  console.log(body);
		});*/

io.on('connection', function(socket) {
	console.log('bing');
	var watcher = chokidar.watch(__dirname + '/generated/', {ignored: /^\./, persistent: true});
	var iterations = 0;
	watcher.on('add' ,function(path){
		setTimeout(function() {
			console.log('File added ' + path);
			if (path.indexOf(".png") !== -1) {
				iterations += 1;
				let image_name = path.split("\\")[path.split("\\").length - 1];
				socket.emit('image', image_name)
				if (iterations == 14)
					socket.emit('doodled');
			}
		},1000);
		
	});

	socket.on('disconnect', function() {
		deleteFileFromGenerated();
		watcher.close();
		iterations = 0;
	})
});

//var jobs = kue.createQueue();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.use(express.static('generated'));
app.use(express.static('public'));
app.use(express.static('styles'));
app.use('/doodled', express.static('doodled'))
app.use('/uploaded', express.static('uploaded'))


app.get('/', function (req,res) {
	res.sendFile( __dirname + '/public/index.html');
});

app.get('/getstyles', function (req,res) {
	let filesList = [];
	fs.readdir('styles', (err, files) => {
	  if (err) throw err;

	  for (const file of files) {
	  	if(file.indexOf("_sem") === -1 && (file.indexOf("png") !== -1 || file.indexOf("jpg") !== -1))
	   		filesList.push(file);
	  }
	  console.log(filesList)
	  res.send(JSON.stringify({files: filesList}))
	});
});

app.get('/getprevious', function (req, res) {
	let filesList = [];
	fs.readdir('doodled', (err, files) => {
	  if (err) throw err;

	  for (const file of files) {
	  	if(file.indexOf("_sem") === -1 && (file.indexOf("png") !== -1 || file.indexOf("jpg") !== -1))
	   		filesList.push(file);
	  }
	  console.log(filesList)
	  res.send(JSON.stringify({files: filesList}))
	});
});

app.post('/' , function (req, res) {
	let photo = req.body.photo;
	let mail = req.body.mail;
	let style = req.body.style;
	let name = Date.now();

	let filePath =  path.join(__dirname, 'uploaded', name + '.png');

	imageDataURI.outputFile(photo, filePath)
		.then(res => {
			console.log("file " + filePath + "| new job recieved", res);
			newJob(name, mail, style);
			return res.status(200).send(JSON.stringify({status: "200"}));
		})
		.catch(err => {
			return res.status(500).send(err);
		})
});

http.listen(7453, function () {
	console.log("Server is running");
});

const deleteFileFromGenerated = function() {
	fs.readdir('generated', (err, files) => {
	  if (err) throw err;

	  for (const file of files) {
	    fs.unlink(path.join('generated', file), err => {
	      if (err) throw err;
	      console.log("Files deleted");
	    });
	  }
	});
}

function newJob (photo , email, style) {
	console.log('Job started: ' + photo);
	//const subprocess = spawn('python', ['neural-doodle.py', '--style', 'samples/Renoir.jpg', '--output', `uploaded/${job.data.photo_name}.png`, '--device=cpu', '--iterations=2', '--phases=1'],
		//{ stdio: 'inherit' });

	const subprocess = spawn('python', ['neural_doodle.py','--nlabels','4', '--style-image','styles/'+style+'.jpg','--style-mask','styles/'+style+'_sem.png','--target-mask','uploaded/'+ photo +'.png','--target-image-prefix','generated/'+photo],{ stdio: 'inherit' });
	subprocess.on('close', function() {
		/* Python script was successfull */
		mv(`generated/${photo}_at_iteration_14.png`, `doodled/${photo}.png`, function(err) {
  			console.log("Got some error : ", err);
		});

		/*let mail = {
			from: 'SDSLabs <srishti@sdslabs-18.co>',
			to: email,
			subject: 'Picasso Doodle',
			text: 'Picasso Doodle for Srishti - 18',
			attachments: [
				{
					filename: "Output.png",
					path: __dirname + `/doodled/${photo}.png` //coastline.png_at_iteration_7
				}
			]
		}

		mailgun.messages().send(mail, function (error, body) {
		  console.log(body);
		});*/


		/** Code to send mail here */
		/** The below code was by kanav so if we want to change we should use mailgun */
		setTimeout( function () {
			var mailOptions ={
				from: 'SDSLabs <srishti@sdslabs-18.co>',
				to: email,
				subject: 'Picasso Doodle',
				text: 'Picasso Doodle for Srishti - 18',
				attachments: [
					{
						filename: "Output.png",
						path: __dirname + `/doodled/${photo}.png` //coastline.png_at_iteration_7
					}
				]
			}
			transporter.sendMail(mailOptions, function (error, response){
				if(error){
					console.log(error);
				}
				else
				{
					console.log('Photo  is mailed at ' + email );
				}
				deleteFileFromGenerated()
			});
		},50)
	});

	subprocess.on('error', function(err) {
		console.log(err);
	})

}

































/*jobs.process('process' , function (job, done) {
	console.log('Job ' + job.id + ' is done');
	//const subprocess = spawn('python', ['neural-doodle.py', '--style', 'samples/Renoir.jpg', '--output', `uploaded/${job.data.photo_name}.png`, '--device=cpu', '--iterations=2', '--phases=1'],
		//{ stdio: 'inherit' });

	const subprocess = spawn('python neural_doodle.py --nlabels 4 --style-image styles/Monet.jpg --style-mask styles/Monet_sem.png --target-mask style/Renoir_sem.png --target-image-prefix generated/monet');
	subprocess.on('close', function() {
		var mailOptions = {
			from: "kanav.proj@gmail.com",
			to: job.data.email,
			subject: "Your Masterpiece is ready!",
			text: "Please find the picture attached",
			attachments: [
				{
					filename: "Output.png",
					path: __dirname + "/uploaded/" + job.data.photo_name + '.png'
				}
			]
		}
		transporter.sendMail(mailOptions, function (error, response){
			if(error){
				console.log(error);
			}
			else
			{
				console.log('Photo of id ' + job.id + ' is mailed at ' + job.data.email );
			}
			done();
		});
	});
});*/

//python neural_doodle.py --nlabels 4 --style-image Monet/style.png --style-mask Monet/style_mask.png --target-mask Monet/target_mask.png --target-image-prefix generated/monet
