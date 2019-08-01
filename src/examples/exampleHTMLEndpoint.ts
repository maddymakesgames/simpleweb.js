import { Endpoint, HTTPMethods } from "../api";
import { ServerResponse, IncomingMessage } from "http";

// Creates the Endpoint object
export class ExampleHTMLEndpoint implements Endpoint {
	name: string = '/html';
	parameters: string[] = ['none'];
	permissionLevel: number = 0;
	returns: string = 'A JSON formatted date object';
	method: HTTPMethods = HTTPMethods.GET;

	run = (req:IncomingMessage, res:ServerResponse):{statusCode:number, response:string} => {
		//Just returns the date within an html body
		return {statusCode:200, response:`<body><p>${new Date().toString()}</p></body>`}
	}
}