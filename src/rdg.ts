import { InternalType } from './snIntrospection';
import { TableSchema, TableColumn } from './schema';

export interface FieldInfo {
    column_label: string; 
    element: string;		// column name
    camelizedName: string;	// camelized column name
    table: string;		// table name (called "name" in the schema)

    internal_type: InternalType;	// ServiceNow type reference
    default_value: string; 
    reference: string;
    choice: string;		// 0 if not a choice field
    choices: string[];		// array of choices if choice field

    jsType: string,
    valueGetter?: string,
    valueSetter?: string
}

export type ChoiceDescription = {
    fieldName: string,
    fieldLabel: string,
    choiceLabel: string,
    choices: string[],
    choicesQuoted: string[]
}

type JsTypeInfo = {
    jsType: string,
    valueGetter?: string,
    valueSetter?: string
}

/**
 * Represents a row data gateway for a ServiceNow table.
 *
 * Contains all the metadata needed to generate a class for the table.
 */
export class RowDataGateway {

    tableName: string;
    className: string;
    fields: FieldInfo[];
    choiceTypes: ChoiceDescription[];

    private _schema: TableSchema;

    /**
     * Given info on some column, figure out what the corresponding
     * type in JavaScript will be and how we get the value from
     * a GlideRecord.
     *  
     * @param column the column info as provided by the schema
     * @returns the JavaScript type and the getter/setter code
     */
    private getJSTypeAndGetter(column: TableColumn): JsTypeInfo {

	let jsType = "";
	let valueGetter = '';
	let valueSetter = `this.${column.element}`;

	switch (column.internal_type) {
            case "reference":
	    case "document_id":
            case "GUID":
		jsType = "sys_id";
		valueGetter = `gr['${column.element}'].toString()`;
		break;
            case "boolean":
		jsType = "boolean";
		valueGetter = `Boolean(gr['${column.element}'])`;
		break;
            case "choice":
            case "string":
            case "field_name":
            case "glide_list":
            case "journal":
            case "journal_list":
            case "journal_input":
            case "user_input":
            case "domain_id":
	    case "domain_path":
            case "related_tags":
            case "user_roles":
            case "documentation_field":
            case "expression":
            case "script":
		jsType = "string";
		valueGetter = `gr['${column.element}'].toString()`;
		break;
	    case "timer":
            case "glide_date_time":
            case "due_date":
		jsType = "GlideDateTime";
		valueGetter = `new GlideDateTime(gr['${column.element}'])`;
		break;
            case "integer":
            case "decimal":
		jsType = "number";
		valueGetter = `Number(gr['${column.element}'])`;
		break;
            case "table_name":
            case "sys_class_name":
		jsType = "InstanceTableNames";
		valueGetter = `gr['${column.element}'].toString()`;
		break;
            case "conditions":
		jsType = "encoded_query";
		valueGetter = `gr['${column.element}'].toString()`;
		break;
            case "glide_duration":
		jsType = "number";
		valueGetter = `this.constructor._epochToSeconds(gr['${column.element}'])`;
		valueSetter = `this.constructor._secondsToEpoch(this.${column.element})`;
		break;
            default:
		throw new Error(`Unknown type '${column.internal_type}' of column '${column.element}'`);
	}

	return {
            jsType,
            valueGetter,
            valueSetter
	};
    }


    /**
     * Convert a string to camel case.
     * 
     * @param str the string to convert
     * @returns the camelized string
     */
    private camelize(str: string): string {
	const label = str.trim().replace(/[_\s]+(\w)?/g, (_, char) => char ? char.toUpperCase() : '')
            .replace(/^[a-z]/, (char) => char.toUpperCase())
            .replace(/(\s+[a-z])/g, (match) => match.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');

        // make sure label does not start with number
        return label.replace(/^[0-9]/, '_$&');
    }

    /**
     * Given a column, return the metadata for the field.
     * Performs the translation from the (table oriented)
     * schema to the (field oriented) metadata.
     * 
     * @param column the column to generate metadata for
     * @returns the field metadata
     */
    private fieldFromColumn(column: TableColumn): FieldInfo {
	const jsTypeInfo = this.getJSTypeAndGetter(column);
	return {
	    column_label: column.column_label,
	    element: column.element,
	    table: column.name,
	    internal_type: column.internal_type,
	    default_value: column.default_value,
	    reference: column.reference,
	    choice: column.choice,
	    choices: column.choices,
	    jsType: jsTypeInfo.jsType,
	    valueGetter: jsTypeInfo.valueGetter,
	    valueSetter: jsTypeInfo.valueSetter,
	    camelizedName: this.camelize(column.column_label)
	};
    }
    
    /**
     * Takes the schema data (information on the columns of a table) and
     * returns the full metadata that can be used to generate a class.
     * 
     * @param schema the schema data
     * @returns table metadata
     */
    constructor(tableName: string, className: string, schema: TableSchema) {
	this.tableName = tableName;
	this.className = className;
	this._schema = schema;

	// map internal column types to javascript types
	this.fields = schema.columns.map(this.fieldFromColumn.bind(this));

	// for choices, we need to construct types for the choices
	const choiceCols = schema.columns.filter((column) => Number(column.choice) > 0);
	this.choiceTypes = choiceCols.map((col) => ({
	    fieldName: col.name,
	    fieldLabel: col.column_label,
	    choiceLabel: this.camelize(`${col.column_label}Choices`),
	    choices: col.choices,
	    choicesQuoted: col.choices.map((choice) => `"${choice}"`)
	}));
    }
}
