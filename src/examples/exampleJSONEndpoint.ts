import { Endpoint, HTTPMethods } from "../api";
import { ServerResponse, IncomingMessage } from "http";

// Creates the Endpoint object
export class ExampleJSONEndpoint implements Endpoint {
	name: string = '/json';
	parameters: string[] = ['none'];
	permissionLevel: number = 0;
	returns: string = 'A JSON formatted date object';
	method: HTTPMethods = HTTPMethods.GET;
	run = (req:IncomingMessage, res:ServerResponse):{statusCode?:number, response:string} => {
		// Just returns the date in JSON format
		return {response:new Date().toJSON()}
	}
}