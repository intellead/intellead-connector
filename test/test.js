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
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var supertest = require('supertest');
var chai = require('chai');
var request_stub = sinon.stub();
var app = proxyquire('../app', {'request': request_stub});
var request = supertest(app);

describe('POST /rd-webhook', function() {

    it('should return status code 401', function(done) {
        request.post('/rd-webhook').expect(401).end(function(err, res) {
            if (err) return done(err);
            done();
        });
    });


});

describe('POST /rd-webhook/1', function() {

    before(function () {
        console.log = function () {};
    });

    after(function () {
        delete console.log;
    });

    it('should return status code 412', function(done) {
        request_stub.withArgs({url: 'http://intellead-security:8080/auth/1'}).yields(null, {'statusCode': 200}, null);
        request.post('/rd-webhook/1').expect(412).end(function(err, res) {
            if (err) return done(err);
            done();
        });
    });

    it('should return status code 200', function(done) {
        var data = {
            leads: {
                email:'john@silva.com'
            }
        };
        request_stub.withArgs({url: 'http://intellead-security:8080/auth/1'}).yields(null, {'statusCode': 200}, null);
        request
            .post('/rd-webhook/1')
            .send({
                'leads': data
            })
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
        });

    });

});

describe('POST /intellead-webhook', function() {

    it('should return status code 412', function(done) {
        request_stub.withArgs({url: 'http://intellead-security:8080/auth/1'}).yields(null, {'statusCode': 200}, null);
        request
            .post('/intellead-webhook')
            .set('token', '1')
            .expect(412)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return status code 200', function(done) {
        var data = {
            leads: {
                email:'john@silva.com'
            }
        };
        request_stub.withArgs({url: 'http://intellead-security:8080/auth/1'}).yields(null, {'statusCode': 200}, null);
        request
            .post('/intellead-webhook')
            .send({
                'leads': data
            })
            .set('Accept', 'application/json')
            .set('token', '1')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return status code 403', function(done) {
        request_stub.withArgs({url: 'http://intellead-security:8080/auth/1'}).yields(null, {'statusCode': 403}, null);
        request
            .post('/intellead-webhook')
            .set('token', '1')
            .expect(403)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });

});