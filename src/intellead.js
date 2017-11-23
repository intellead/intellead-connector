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

module.exports = {

    is_qualified_by_intellead: function(lead_status) {
        if (lead_status == 1) {
            return true;
        }
        return false;
    },
    send_the_lead_to_intellead_data: function (data) {
        request({ url: dataWebhookUrl, method: 'POST', json: data}, function(error, response, body) {
            if (error) {
                console.log(error);
            }
            if (response.statusCode == 200) {
                console.log('The lead was sent to intellead-data.');
            } else {
                console.log('The lead was sent to intellead-data but something wrong happened. Status code: ' + response.statusCode);
            }
        });
    }

};