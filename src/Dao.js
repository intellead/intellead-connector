'use strict';

/*
 *
 * Copyright 2017 Softplan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGODB_URI || 'mongodb://intellead-connector-mongodb:27017/local';


class Dao {

    saveConversion(lead, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                db.collection('leads').save(
                    {lead},
                    function(err, result) {
                        if (err) {
                            console.log(err);
                        }
                        db.close();
                        callback(err, result);
                    }
                );
            }
        });
    }

    numberOfConversionByEmail(callback){
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                callback(err);
            } else {
                db.collection('leads').aggregate(
                    [
                        {
                            $group:
                                {
                                    _id: { email: "email" },
                                    count: { $sum: 1 }
                                }
                        }
                    ],
                    function(err, result) {
                        if (err) {
                            console.log(err);
                        }
                        db.close();
                        callback(err, result);
                    }
                );
            }
        });

    }

}
module.exports = Dao;
