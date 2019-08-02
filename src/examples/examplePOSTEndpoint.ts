import { Endpoint, HTTPMethods } from "../api";
import { ServerResponse, IncomingMessage, request } from "http";
import * as fs from 'fs';

export class ExamplePOSTEndpoint implements Endpoint {
	name: string = '/post';
	parameters: string[] = ['Any'];
	permissionLevel: number = 0;
	returns: string = 'The data in the body of the request';
	method: HTTPMethods = HTTPMethods.POST;

	async run(req: IncomingMessage, res: ServerResponse):Promise<{response:string}> {
		res.setHeader('content-type', <string>req.headers['content-type']);
		let data = await asyncReadReq(req);
		return {response:data};
	}
}

function asyncReadReq(req:IncomingMessage):Promise<string> {
	return new Promise((resolve, reject) => {
		let d = '';
		req.on('data', (chunk) => d+=chunk);
		req.on('end', () =>resolve(d));
		req.on('error', (err) => reject(err));
	});
}