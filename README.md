# Table of Contents

1.  [Prerequisites](#orgdf3e79f)
2.  [Installation](#org917902d)
3.  [Usage](#org2b37fc8)
4.  [Example](#orga7f49d9)
5.  [Using Emacs](#orgbda74d3)
6.  [Architecture](#orgc637806)
7.  [Contributing](#orgc5ea605)
8.  [License](#org374e99a)
9.  [Authors](#orgdceeab7)

Generate Row Data Gateways[1] for ServiceNow Tables.


<a id="orgdf3e79f"></a>

# Prerequisites

-   Node.js (>= 12.x.x)
-   npm (>= 6.x.x)
-   A ServiceNow instance
-   API key for the ServiceNow instance


<a id="org917902d"></a>

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
    
    Replace \`<your\_instance\_name>\` with the name of your ServiceNow instance and \`<your\_api\_key>\` with your API key.
    
    **NOTE**: To create an API key, navigate to "System Web Services >> API Access Policies >> REST API Key" (or go directly to table "api\_key") in your ServiceNow instance and create a new key. If you do not have this option, you might have to activate the plugin "API Key and HMAC Authentication" (com.glide.tokenbased\_auth).

4.  Install the ServiceNow application:
    
    Import the provided update set XML into your ServiceNow instance.

5.  Configure API Key
    
    Create an API key in your ServiceNow instance and assign it to the REST API[2].


<a id="org2b37fc8"></a>

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

Replace \`<table\_name>\` with the name of your ServiceNow table.


## Generate Row Data Gateway Class

Generate a Row Data Gateway class for a given ServiceNow table.

```sh
snrdg generate <table_name> <class_name> [template]
```

Replace \`<table\_name>\` with the name of your ServiceNow table and \`<class\_name>\` with the desired name for the generated class.

The "template" parameter is optional. By default, a ES5 JavaScript class will be generated. There is also a template for an ES6 class available. You can use that with the template "class\_es6".


<a id="orga7f49d9"></a>

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


<a id="orgbda74d3"></a>

# Using Emacs

If you are already using [snSYNC](https://github.com/julian-hoch/snSYNC), you can easily integrate snRDG into your workflow. Instead of manually handling the CLI, you can let Emacs do the work for you. Just open the Script Include buffer you want to regenerate, and run the command `snrdg-generate`. This will automatically generate the class and update the buffer (you still need to save it manually).

For this to work, you should create a \`.env\` file in the base directory of snSYNC (where the `snrdg` command is available) with your API key as described above. You should also place the templates there in subdirectory named "templates". If you want, you can also create a symlink to the templates directory in the git repository, so you always have the latest version.


<a id="orgc637806"></a>

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


<a id="orgc5ea605"></a>

# Contributing

Feel free to submit issues or pull requests. Any help is greatly appreciated!


<a id="org374e99a"></a>

# License

This project is licensed under the GPL-3.0 License. See the LICENSE file for details.


<a id="orgdceeab7"></a>

# Authors

Developed by Julian Hoch.
