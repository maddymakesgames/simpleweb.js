import { Api } from "../api";
import { IncomingMessage, get, request } from "http";
import { ExampleBasicAuthenticatedEndpoint } from "./exampleBasicAuthentication";
import { ExampleHTMLEndpoint } from "./exampleHTMLEndpoint";
import { ExampleJSONEndpoint } from "./exampleJSONEndpoint";
import { ExamplePOSTEndpoint } from "./examplePOSTEndpoint";


// Creates and api running on port 8000 and supply it with a function to test for authentication
const api = new Api({port:8000, base:'/api'}, (req:IncomingMessage):number => {
	// Only use basic authentication on the protected endpoint
	if(req.url != '/api/basic' && req.url != '/api/basic/') return 0;
	
	//Basic authentication code
	let auth = req.headers['authorization'];
	if(!auth) return -1;
	if(!auth.startsWith('Basic')) return -1;
	let encript = auth.split(' ')[1];
	let buf = Buffer.from(encript, "base64");
	let user = users[buf.toString('utf8').split(':')[0]];
	if(!user) return -1;
	if(user.password != buf.toString('utf8').split(':')[1]) return -1
	return user.permissions;
});

// Stores the user data to be used with the Basic auth, never store actual passwords in plaintext!
const users:any = {
	admin:{
		password:'admin',
		permissions:6
	},
	public:{
		password:'public',
		permissions:0
	},
	testing:{
		password:'secret',
		permissions:4
	}
}

// Adds the endpoints to the api
api.addEndpoint(new ExampleBasicAuthenticatedEndpoint());
api.addEndpoint(new ExampleHTMLEndpoint());
api.addEndpoint(new ExampleJSONEndpoint());
api.addEndpoint(new ExamplePOSTEndpoint());

// Sends requests to each endpoint to use as examples
get({hostname:'localhost', port:8000, path:'/api/json'}, (res) => logRes(res));

get({hostname:'localhost', port:8000, path:'/api/html'}, (res) => logRes(res));

get({hostname:'localhost', port:8000, auth:'admin:admin', path:'/api/basic'}, (res) => logRes(res, 'admin','admin'));
get({hostname:'localhost', port:8000, auth:'public:public', path:'/api/basic'}, (res) => logRes(res, 'public','public'));
get({hostname:'localhost', port:8000, auth:'testing:secret', path:'/api/basic'}, (res) => logRes(res, 'testing','secret'));
get({hostname:'localhost', port:8000, auth:'hacker:hax', path:'/api/basic'}, (res) => logRes(res, 'hacker','hax'));

const postReq = request({hostname:'localhost', port:8000, path:'/api/post', method:'POST', headers:{'content-type':'text/plain'}}, (res) => logRes(res));
postReq.write('test');
postReq.end()

// Helper function to log the response from requests
function logRes (res:IncomingMessage, username?:string, password?:string) {
	let data = `${username && password ? `User: ${username} \n Pass: ${password} \n` : ''} response:`
	res.on('data', (c) => data += c);
	res.on('end', () => console.log(data))
}