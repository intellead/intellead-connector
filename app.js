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

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var securityUrl = process.env.SECURITY_URL || 'http://intellead-security:8080/auth';
var intellead = require('./src/intellead');
var rdstation = require('./src/rdstation');
var exactspotter = require('./src/exactspotter');
var victoria = require('./src/victoria');
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init(process.env.PRIVATE_TOKEN_MIXPANEL, {
    protocol: 'https'
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");
    next();
});

app.post('/rd-webhook/:token', function (req, res) {
    var token = req.param('token');
    request({ url: securityUrl + '/' + token}, function(error, response, authBody) {
        if (response.statusCode != 200) {
            if (error) {
                console.log(error);
            }
            return res.sendStatus(response.statusCode);
        }
        var body = req.body;
        var leads = body["leads"];
        if (!leads) return res.sendStatus(412);
        for (var index in leads) {
            var lead = leads[index];
            console.log('The lead with email ' + lead.email + ' has arrived.');
            intellead.send_the_lead_to_intellead_data(token, body);
            console.log('The lead with email ' + lead.email + ' was sent to intellead.');
            let area = lead.custom_fields != undefined && lead.custom_fields['Área'] != undefined ? lead.custom_fields['Área'] : 'Não informado';
            mixpanel.track('Converteu novo lead.');
            mixpanel.people.set(lead.email, {
                $first_name: lead.name,
                $created: (new Date()).toISOString(),
                $email: lead.email,
                job_title: lead.job_title,
                area: area,
                lead_stage: lead.lead_stage,
                company: lead.company,
                number_conversions: lead.number_conversions
            });
            return res.sendStatus(200);
        }
    });
});

app.post('/intellead-webhook', function (req, res) {
    var token = req.header('token');
    request({ url: securityUrl + '/' + token}, function(error, response, authBody) {
        if (response.statusCode != 200) {
            if (error) {
                console.log(error);
            }
            return res.sendStatus(response.statusCode);
        }
        var body = req.body;
        var leads = body["leads"];
        if (!leads) return res.sendStatus(412);
        for (var index in leads) {
            var lead = leads[index];
            if (intellead.is_qualified_by_intellead(lead.lead_status)) {
                console.log('The lead with email ' + lead.email + ' is qualified by intellead.');
                victoria.send_the_lead_to_victoria(lead);
                //rdstation.change_the_lead_at_the_funnel_stage_to_qualified(lead.email);
                //exactspotter.insert_lead(lead.email, lead.name, lead.company, lead.job_title, lead.personal_phone);
            }
        }
        return res.sendStatus(200);
    });
});

app.post('/classification/instance/:token', function (req, res) {
    var token = req.param('token');
    request({ url: securityUrl + '/' + token}, function(error, response, authBody) {
        if (response.statusCode != 200) {
            if (error) {
                console.log(error);
            }
            return res.sendStatus(response.statusCode);
        }
        var data = req.body;
        if (data) {
            intellead.get_lead_from_intellead_data(token, data, function(lead_data) {
                intellead.normalize_lead_data(token, lead_data, function (lead_data_normalized) {
                    lead_data_normalized.email = lead_data.lead.email;
                    intellead.send_lead_data_to_dataset(token, lead_data_normalized);
                    return res.sendStatus(201);
                });
            });
        }
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // router the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
