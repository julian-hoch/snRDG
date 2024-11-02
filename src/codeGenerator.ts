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
     * @param rdg RowDataGateway object containing the metadata of a table
     * @param template base name (without extension) of the template to use
     * @returns the source code of the class
     */
     static async generateClass(rdg: RowDataGateway, template: string): Promise<string> {
	eta.configure({
            views: path.resolve('templates'),
            autoEscape: false
	});

	const res = await eta.renderFile(template, {
            tableName: rdg.tableName,
            className: rdg.className,
            columns: rdg.fields,
            choiceTypes: rdg.choiceTypes
	});

	return res;
    }

}

export default CodeGenerator;
