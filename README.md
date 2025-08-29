# Table of Contents

1.  [Prerequisites](#org6a2cb6d)
2.  [Installation](#org7096910)
3.  [Usage](#orgf3f9c5e)
4.  [Example](#orge2379f0)
5.  [Architecture](#org687249c)
6.  [Contributing](#org022226f)
7.  [License](#org68aadca)
8.  [Authors](#org2160a41)

Generate Row Data Gateways[1] for ServiceNow Tables.


<a id="org6a2cb6d"></a>

# Prerequisites

-   Node.js (>= 12.x.x)
-   npm (>= 6.x.x)
-   A ServiceNow instance
-   API key for the ServiceNow instance


<a id="org7096910"></a>

# Installation

1.  Clone the repository:
    
    ```sh
    git clone https://github.com/julian-hoch/snRDG.git
    ```

2.  Install the dependencies:
    
    ```sh
    npm run build && npm install -g
    ```

3.  Configure environment variables:
    
    Create a \`.env\` file in the root of your project and add the following variables:
    
    ```sh
    SNRDG_INSTANCE=<your_instance_name>
    SNRDG_API_KEY=<your_api_key>
    ```
    
    Replace \`<your<sub>instance</sub><sub>name</sub>>\` with the name of your ServiceNow instance and \`<your<sub>api</sub><sub>key</sub>>\` with your API key.
    
    **NOTE**: To create an API key, navigate to "System Web Services >> API Access Policies >> REST API Key" (or go directly to table "api<sub>key</sub>") in your ServiceNow instance and create a new key. If you do not have this option, you might have to activate the plugin "API Key and HMAC Authentication" (com.glide.tokenbased<sub>auth</sub>).

4.  Install the ServiceNow application:
    
    Import the provided update set XML into your ServiceNow instance.

5.  Configure API Key
    
    Create an API key in your ServiceNow instance and assign it to the REST API[2].


<a id="orgf3f9c5e"></a>

# Usage

The following commands are available to interact with the ServiceNow instance:


## Test Access

Ensure your environment is set up correctly, and you can access your ServiceNow instance.

```sh
snrdg test
```

This will test the connection and confirm the setup.


## **Get Schema**

Retrieve the schema of a specific table in JSON format.

```sh
snrdg schema <table_name>
```

Replace \`<table<sub>name</sub>>\` with the name of your ServiceNow table.


## Generate Row Data Gateway Class

Generate a Row Data Gateway class for a given ServiceNow table.

```sh
snrdg generate <table_name> <class_name> [template]
```

Replace \`<table<sub>name</sub>>\` with the name of your ServiceNow table and \`<class<sub>name</sub>>\` with the desired name for the generated class.

The "template" parameter is optional. By default, a ES5 JavaScript class will be generated. There is also a template for an ES6 class available. You can use that with the template "class<sub>es6</sub>".


<a id="orge2379f0"></a>

# Example

Here's an example of how to use the commands:

```sh
snrdg test
snrdg schema incident
snrdg generate incident IncidentRDG
```

Or, to get an ES6 class, and to directly store it in a file (adjust the path to your needs):

```sh
snrdg generate incident IncidentRDG ./templates/class_es6 > ./IncidentRDG.js
```

You can then upload the generated class to your ServiceNow instance and save it as a Script Include to use it in your scripts.


<a id="org687249c"></a>

# Architecture

The project consists of three main parts:


## ServiceNow Application

The ServiceNow application is responsible for compiling the metadata of the table and provides a REST API to access the schema information. It is secured via an API key[3].

The installation can be installed using the provided update set XML (directory "app"). The source is also included in this GIT repository for convenience.

See directory `sys_script_include`.


## Client

The client provides a simple CLI to query the instance and generate classes based on the table schema. The client is written in TypeScript and uses the Axios library for HTTP requests. To generate the class, the client uses the Eta template engine.


## Templates

The templates for generating the classes are located in the `/templates` directory. The Eta template engine uses these templates to generate the JavaScript class code based on the table schema. Feel free to adjust the templates to your own needs, or to add new templates.


<a id="org022226f"></a>

# Contributing

Feel free to submit issues or pull requests. Any help is greatly appreciated!


<a id="org68aadca"></a>

# License

This project is licensed under the GPL-3.0 License. See the LICENSE file for details.


<a id="org2160a41"></a>

# Authors

Developed by Julian Hoch.
