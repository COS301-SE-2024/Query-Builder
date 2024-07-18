import { Injectable } from '@nestjs/common';
import { QueryParams, table, column } from '../interfaces/intermediateJSON';

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

}