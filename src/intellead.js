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
var request = require('request');
var dataWebhookUrl = process.env.DATA_WEBHOOK_URL || 'http://intellead-data:3000/rd-webhook';
var dataLeadInfoUrl = process.env.DATA_LEAD_INFO_URL || 'http://intellead-data:3000/lead-info-by-email';
var normalizationLeadUrl = process.env.NORMALIZATION_LEAD_URL || 'http://intellead-normalization:3000/normalize';
var classificationDatasetUrl = process.env.CLASSIFICATION_DATASET_URL || 'http://intellead-classification:5000/save_lead_in_dataset';

module.exports = {

    is_qualified_by_intellead: function(lead_status) {
        if (lead_status == 1) {
            return true;
        }
        return false;
    },
    send_the_lead_to_intellead_data: function (token, data) {
        var options = {
            url: dataWebhookUrl,
            method: 'POST',
            json: data,
            headers: {token: token}
        };
        request(options, function(error, response, body) {
            if (error) {
                console.log(error);
            }
            if (response.statusCode == 200) {
                console.log('The lead was sent to intellead-data.');
            } else {
                console.log('The lead was sent to intellead-data but something wrong happened. Status code: ' + response.statusCode);
            }
        });
    },
    send_lead_data_to_dataset: function (token, data) {
        var options = {
            url: classificationDatasetUrl,
            method: 'POST',
            json: data,
            headers: {token: token}
        };
        request(options, function(error, response, body) {
            if (error) {
                console.log(error);
            }
            if (response.statusCode == 201) {
                console.log('The lead was sent to dataset in intellead-classification.');
            } else {
                console.log('The lead was sent to dataset in intellead-classification but something wrong happened. Status code: ' + response.statusCode);
            }
        });
    },
    get_lead_from_intellead_data: function (token, data, callback) {
        var options = {
            url: dataLeadInfoUrl,
            method: 'POST',
            json: data,
            headers: {token: token}
        };
        request(options, function(error, response, lead_data) {
            if (error) {
                console.log(error);
            }
            if (response.statusCode == 200) {
                console.log('The lead was received from intellead-data.');
                return callback(lead_data);
            } else {
                console.log('The lead was not received from intellead-data. Something wrong happened. Status code: ' + response.statusCode);
            }
            return callback();
        });
    },
    normalize_lead_data : function (token, data, callback) {
        var options = {
            url: normalizationLeadUrl,
            method: 'POST',
            json: data,
            headers: {token: token}
        };
        request(options, function (error, response, lead_data_normalized) {
            if (error) {
                console.log(error);
            }
            if (response.statusCode == 200) {
                console.log('The lead was normalized by intellead-normalization: ' + JSON.stringify(lead_data_normalized));
                return callback(lead_data_normalized);
            } else {
                console.log('The lead was not normalized by intellead-normalization. Something wrong happened. Status code: ' + response.statusCode);
            }
            return callback();
        });
    }

};