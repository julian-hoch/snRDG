import { InternalType } from './snIntrospection';

export interface TableColumn {
    name		: string;	// name of the *table*

    column_label	: string; 
    element		: string;	// column name

    internal_type	: InternalType;	// ServiceNow type reference
    default_value	: string; 
    reference		: string;
    choice		: string;	// 0 if not a choice field
    choices		: string[];	// array of choices if choice field
}

export class TableSchema {
    tableName		: string;
    columns		: TableColumn[];
}

