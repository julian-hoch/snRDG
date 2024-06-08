import * as eta from 'eta';
import path from 'path';
import { RowDataGateway, FieldInfo, ChoiceDescription } from './rdg';

type TemplateInput = {
    tableName		: string,
    className		: string,
    choiceTypes		: ChoiceDescription[],
    columns		: FieldInfo[]
}

/**
 * ServiceNow Code Generator
 *
 * Used to generate JavaScript code for ServiceNow tables.
 */
class CodeGenerator {

    /**
     * Given a table description, generate a class (ES6 javascript class).
     * 
     * @param tableName the name of the table
     * @param className name of the class
     * @param metaData object containing the servicenow metadata of a table
     * @returns the source code of the class
     */
    static async generateClass(rdg: RowDataGateway): Promise<string> {
	eta.configure({
            views: path.resolve('templates'),
            autoEscape: false
	});

	const res = await eta.renderFile('./class_template', {
            tableName: rdg.tableName,
            className: rdg.className,
            columns: rdg.fields,
            choiceTypes: rdg.choiceTypes
	});

	return res;
    }

}

export default CodeGenerator;
