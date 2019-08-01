# Simple Api Framework

This is a simple framework that can be used to develop apis or web applications with node.js

## Building

To build first clone this repository and then run `npm install` in the directory
Then run `npm run build`
To test run `npm run test` or `npm run buildAndRun` this will run /dist/examples/runExamples.js

## Installing

To install run `npm i //TODO get npm name`

## Using

To use the api framework first install it via npm.
First you must import the framework and create an instance of it.

```javascript
const Api = require('api');

const api = new Api();
```

To add an endpoint you need to create and endpoint object and add that to end api instance

Endpoints using javascript object literals

```javascript
const HelloWorldEndpoint = {
    name: '/helloWorld',
    parameters: ['none'],
    permissionLevel: 0,
    returns: 'Hello World',
    method: HTTPMethods.GET,
    run: (req, res) => {
        return {response:'Hello World!'}
    };
}

api.addEndpoint(HelloWorldEndpoint);
```

Endpoints using typescript class implements

```typescript
class HelloWorldExample implements Endpoint {
    name = '/helloWorld';
    parameters = ['none'];
    permissionLevel = 0;
    returns = 'Hello World!';
    method = HTTPMethods.GET;
    run = (req, res) => {
        return {response:'Hello World!'}
    };
}

api.addEndpoint(new HelloWorldExample());
```

For more detailed examples check out the example endpoints
