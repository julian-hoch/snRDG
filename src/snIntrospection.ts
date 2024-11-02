export type InternalType =
    | "GUID"
    | "boolean"
    | "choice"
    | "conditions"
    | "decimal"
    | "document_id"
    | "documentation_field"
    | "domain_path"
    | "domain_id"
    | "due_date"
    | "expression"
    | "field_name"
    | "glide_date_time"
    | "glide_list"
    | "glide_duration"
    | "integer"
    | "journal"
    | "journal_input"
    | "journal_list"
    | "reference"
    | "related_tags"
    | "script"
    | "string"
    | "sys_class_name"
    | "table_name"
    | "timer"
    | "user_input"
    | "user_roles";

export interface TableColumn {
    name: string;			// name of the *table*

    column_label: string; 
    element: string;			// column name

    internal_type: InternalType;	// ServiceNow type reference
    default_value: string; 
    reference: string;
    choice: string;			// 0 if not a choice field
    choices: string[];			// array of choices if choice field
}

export type TableMetaData = {
    columns: TableColumn[];
}

type JsTypeInfo = {
    jsType: string,
    valueGetter?: string,
    valueSetter?: string
}
