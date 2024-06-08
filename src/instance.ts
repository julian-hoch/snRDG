import axios, { AxiosResponse } from 'axios';
import chalk from 'chalk';
import { TableSchema } from './schema';

/**
 * ServiceNowInstance class. 
 * 
 * Handles communication with a ServiceNow instance.
 */
class ServiceNowInstance {

    /**
     * The instance name is the unique identifier for the instance.
     * Typically, the instance name is the same as the subdomain in the instance URL.
     * For example, the instance name for https://dev12345.service-now.com is dev12345.
     */
    private _instance: string;

    /**
     * The API key is the password for the REST API.
     */
    private _apiKey: string;

    /**
     * Make a GET request to the ServiceNow instance.
     *
     * @param url The URL to GET.
     * @returns The response from the GET request.
     * @throws Error if the GET request fails.
     */
    private async getRequest(url: string): Promise<any> {
	const baseURL = `https://${this._instance}.service-now.com`;
	const headers = {
	    "Accept": "application/json",
	    "Content-Type": "application/json",
	    "x-sn-apikey": this._apiKey
	};
	
	try {
	    const result = await axios.get(url, {baseURL, headers});
	    const data = result.data;
	    return data;
	} catch (error) {
	    if (axios.isAxiosError(error)) {
                if (error?.response?.status) {
                    console.warn(`GET request to URL ${chalk.grey(url)} failed. Error ${chalk.red(error?.response?.status)} ${chalk.blue(error?.response?.statusText)}`);
                } else {
                    console.warn(`GET request to URL ${chalk.grey(url)} failed. Error ${chalk.red(error?.message)}`);
                }

		if (error?.response?.data?.status === "failure" ) {
		    console.warn(`ServiceNow error: ${error?.response?.data?.error?.message}`);
		    console.debug('ServiceNow error details:', error?.response?.data?.error?.detail);
		}
                console.debug('Full Error:', error);
            }
	    else {
                console.warn(`GET request to URL ${chalk.grey(url)} failed.`, error);
            }

	    throw error;
	}
    }	

    /**
     * Test access to the instance by running a null query to the GraphQL endpoint.
     *
     * @returns True if the instance is accessible; otherwise, false.
     */
    public async test(): Promise<boolean> {
	const url = "/api/now/graphql";

	try {
	    await this.getRequest(url);
	    return true;
	} catch (error) {
	    return false;
	} 
    }

    /**
     * Will look up the schema for the given table.
     * 
     * @param table table name too look up
     * @returns schema of the table
     */
    async getSchema(table: string): Promise<TableSchema> {
        const url = `api/x_890366_snrdg/table_schema/${table}`;
        const result = await this.getRequest(url);

        return {
	    columns: result?.result,
	    tableName: table
	} as TableSchema;
    }

    /**
     * Creates a new ServiceNowInstance object.
     *
     * @param instance The instance name (first part of hostname).
     * @param apiKey The API key (as set in instance).
     */
    constructor(instance, apiKey) { 
	this._instance = instance;
	this._apiKey = apiKey;
    }
}

export default ServiceNowInstance;
