'use strict';
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGODB_URI;
var _ = require('lodash');


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
