import { Endpoint, HTTPMethods } from "../api";
import { ServerResponse, IncomingMessage, get } from "http";


// Create Endpoint object
export class ExampleBasicAuthenticatedEndpoint implements Endpoint {
	name: string = '/basic';
	parameters: string[] = ['none'];
	permissionLevel: number = 4;
	returns: string = 'A JSON formatted date object';
	method: HTTPMethods = HTTPMethods.GET;

	run = (req:IncomingMessage, res:ServerResponse, permissionLevel?:number):{statusCode?:number, response:string} => {
		// Just return the user's given permission level
		return { response:`{level:${permissionLevel}}`}
	}
}