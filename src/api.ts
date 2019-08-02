import * as https from 'https';
import * as http from 'http';
import { IncomingMessage, ServerResponse } from "http";

export class Api {
	private port: number;
	private base: string;
	private endpoints: Map<string, Endpoint>;
	public server: https.Server | http.Server;
	public protocol: Protocol;
	public authenticationTest:(req:IncomingMessage)=>number;

	constructor(options:ApiOptions = {port:443, base:''}, authenticationTest:(req:IncomingMessage)=>number = () => 0) {
		this.port = options.port || 443;
		this.base = options.base || '';
		this.endpoints = new Map();
		this.protocol = Protocol.HTTP;
		this.authenticationTest = authenticationTest;

		let serverOptions:https.ServerOptions = {};
		if(options.cert && options.key) {
			serverOptions.cert = options.cert;
			serverOptions.key = options.key;
			this.protocol = Protocol.HTTPS;
		}

		if(this.protocol == Protocol.HTTPS) this.server = https.createServer(serverOptions, this.handleResponse.bind(this)).listen(this.port);
		else this.server = http.createServer(serverOptions, this.handleResponse.bind(this)).listen(this.port);
	}

	/**
	 * What to do when the server recieves a request
	 * @param req The request
	 * @param res The response
	 */
	async handleResponse(req:IncomingMessage, res:ServerResponse) {
		// Do authentication stuff
		let authenticated = this.authenticationTest(req);
		if(authenticated < 0) return this.returnResponse(res, 401, 'Unauthorized');
		
		// If the base url isn't provided return a 404
		if(!(<string>req.url).startsWith(this.base)) return this.returnResponse(res, 404, `API requires a base url of ${this.base}`);
		
		// If no endpoint is specified give the api docs
		if(req.url == this.base || req.url+'/' == this.base || this.base+'/' == req.url) return this.returnResponse(res, 200, this.formatApiDocs())

		// Get the selected endpoint
		let endpoint = (<string>req.url).slice(this.base.length).split('?')[0];
		let splitEndpoint = endpoint.split('/');
		endpoint = splitEndpoint.filter((s)=>s!='').join('/');
		let e = this.endpoints.get(endpoint) || this.endpoints.get(endpoint + '/') || this.endpoints.get(splitEndpoint.join('/'));
		
		// Return an error if no endpoint is found or if the user doesn't have the required permissions
		if(!e) return this.returnResponse(res, 404, `No endpoint found matching ${endpoint}`);
		if(e.permissionLevel > authenticated) return this.returnResponse(res, 403, 'Not enough permissions')
		
		// Run the endpoint and then send the result back to the user
		let r = await e.run(req, res, authenticated);
		this.returnResponse(res, r.statusCode || 200, r.response);
	}

	// Sends data to the user, sets the status code and ends the response.
	returnResponse(res:ServerResponse, statusCode?:number, message?:string):void {
		res.statusCode = statusCode || 200;
		res.end(message);
	}


	/**
	 * Adds an endpoint to the api
	 * @param endpoint The endpoint to be added
	 */
	addEndpoint(endpoint:Endpoint):void {
		const split = endpoint.name.split('/');
		this.endpoints.set(split.filter((s)=>s!='').join('/'), endpoint);
	}

	/**
	 * Returns the formatted api documentation based on the current endpoints
	 */
	formatApiDocs():string {
		let html = '<!DOCTYPE html><head><style>h1 {margin-bottom:10px;margin-top:10px;}h2 {margin-left: 1em;margin-top:10px;margin-bottom:10px;}h3 {margin-left: 3em;margin-top:10px;margin-bottom:10px;}h4 {margin-left: 5em;margin-top:10px;margin-bottom:10px;}h5 {margin-left: 7em;margin-top:10px;margin-bottom:10px;}h6 {margin-left: 9em;margin-top:10px;margin-bottom:10px;}</style></head><body><u><h1>Api Documentation</h1>'
		this.endpoints.forEach((endpoint) => {
			html += `<h2>${endpoint.name}</h2><h3>Method</h3></u><h4>${endpoint.method}</h4><u><h3>Returns</h3></u><h4>${endpoint.returns}</h4><u><h3>Parameters</h3></u><h4>${endpoint.parameters.join('<br>')}</h4><u><h3>Permission level required</h3></u><h4>${endpoint.permissionLevel}</h4>`
		})
		return html + '</body>';
	}
}

export interface ApiOptions {
	port?:number;
	base?:string;
	cert?:string;
	key?:string;
}

export interface Endpoint {
	name:string;
	run:(req: http.IncomingMessage, res: http.ServerResponse, permLevel?:number) => (Promise<{statusCode?:number; response:string; }> | {statusCode?:number; response:string});
	parameters: string[];
	permissionLevel: number;
	returns: string;
	method: HTTPMethods;
}

export enum HTTPMethods {
	GET = 'GET',
	POST = 'POST',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
	OPTIONS = 'OPTIONS',
	HEAD = 'HEAD',
	PUT = 'PUT',
	TRACE = 'TRACE',
	CONNECT = 'CONNECT'
}

export enum Protocol {
	HTTP,
	HTTPS
}