import { Injectable } from '@nestjs/common';
import { condition, compoundCondition, primitiveCondition, ComparisonOperator, QueryParams, table, column } from '../interfaces/intermediateJSON';

@Injectable()
export class mongoJsonConverterService {

    convertJsonToQuery(queryParams: QueryParams){

        //Returns the JSON object that will be passed into the MongoDB driver's runCommand() function like so:
        // db.runCommand(
        //     {
        //        find: <string>,
        //        filter: <document>,
        //        sort: <document>,
        //        projection: <document>,
        //        hint: <document or string>,
        //        skip: <int>,
        //        limit: <int>,
        //        batchSize: <int>,
        //        singleBatch: <bool>,
        //        comment: <any>,
        //        maxTimeMS: <int>,
        //        readConcern: <document>,
        //        max: <document>,
        //        min: <document>,
        //        returnKey: <bool>,
        //        showRecordId: <bool>,
        //        tailable: <bool>,
        //        oplogReplay: <bool>,
        //        noCursorTimeout: <bool>,
        //        awaitData: <bool>,
        //        allowPartialResults: <bool>,
        //        collation: <document>,
        //        allowDiskUse : <bool>,
        //        let: <document> // Added in MongoDB 5.0
        //     }
        // )

        return {
            find: this.generateFindString(queryParams),
            filter: this.generateFilterObject(queryParams),
            sort: this.generateSortObject(queryParams),
            projection: this.generateProjectionObject(queryParams),
            skip: this.generateSkipInt(queryParams),
            limit: this.generateLimitInt(queryParams)
        };

    }

    //function that generates the 'find' string of the JSON object
    //'find' specifies the MongoDb collection to query
    generateFindString(queryParams: QueryParams){
        return queryParams.table.name;
    }

    //function that generates the 'filter' object of the JSON object
    generateFilterObject(queryParams: QueryParams){
        //TODO
    }

    //function that generates the 'sort' object of the JSON object
    generateSortObject(queryParams: QueryParams){
        
        //create a string version of the object
        const sortString = '{ ' + queryParams.sortParams.column + ': 1 }';

        //return object parsed into JSON
        return JSON.parse(sortString);

    }

    //function that generates the 'projection' object of the JSON object
    //'projection' specifies the fields to return
    generateProjectionObject(queryParams: QueryParams){

        //create a string version of the object
        let projectionString = '{ ';

        //iterate over the columns to return and add them to the projection object
        for(const column of queryParams.table.columns){
            projectionString += column.name + ' 1,'
        }

        projectionString += ' }';

        //return object parsed into JSON
        return JSON.parse(projectionString);

    }

    //function that generates the 'skip' int of the JSON object
    //'skip' specifies the number of documents to skip before returning a document
    generateSkipInt(queryParams: QueryParams){

        //we must skip one less page than the page number we want to return
        const numPagesToSkip = queryParams.pageParams.pageNumber-1;
        //to get the number of documents per page, multiply number of pages by documents per page
        const numDocsToSkip = numPagesToSkip*queryParams.pageParams.rowsPerPage;
        
        return numDocsToSkip;

    }

    //function that generates the 'limit' int of the JSON object
    generateLimitInt(queryParams: QueryParams){
        return queryParams.pageParams.rowsPerPage;
    }

    sqlToMongoOperator(sqlOperator: ComparisonOperator): string {
        switch (sqlOperator) {
            case '=':
                return "$eq";
            case '<':
                return "$lt";
            case '>':
                return "$gt";
            case '<=':
                return "$lte";
            case '>=':
                return "$gte";
            case '<>':
                return "$ne";
            case 'LIKE':
                return "$regex"; // MongoDB uses regex for pattern matching
            case ComparisonOperator.EQUAL:
                return "$eq";
            case ComparisonOperator.LESS_THAN:
                return "$lt";
            case ComparisonOperator.GREATER_THAN:
                return "$gt";
            case ComparisonOperator.LESS_THAN_EQUAL:
                return "$lte";
            case ComparisonOperator.GREATER_THAN_EQUAL:
                return "$gte";
            case ComparisonOperator.NOT_EQUAL:
                return "$ne";
            case ComparisonOperator.LIKE:
                return "$regex"; // MongoDB uses regex for pattern matching
            default:
                throw new Error(`Unsupported operator: ${sqlOperator}`);
        }
    }

    conditionMongo(condition: condition)
    {
        if (!condition) 
            {
                return {};
            }
    
        if (this.isPrimitiveCondition(condition)) 
            {
                const primCondition = condition as primitiveCondition;
                return {[primCondition.column]: {[this.sqlToMongoOperator(primCondition.operator)]: primCondition.value}};
            } 
        else if (this.isCompoundCondition(condition)) 
            {
                const compCondition = condition as compoundCondition;
                let conditions: object[] = [];
                for (let i = 0; i < compCondition.conditions.length; i++) 
                    {
                        const cond = this.conditionMongo(compCondition.conditions[i]);
                        conditions.push(cond);
                    }
                return {[compCondition.operator]: conditions};
            }
        return {};
    }

    private isCompoundCondition(condition: any): condition is compoundCondition 
    {
        return (condition as compoundCondition).conditions !== undefined;
    }

    private isPrimitiveCondition(condition: any): condition is primitiveCondition 
    {
        return (condition as primitiveCondition).column !== undefined;
    }

}