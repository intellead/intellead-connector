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

module.exports = {

    send_the_lead_to_victoria: function(lead) {
        var data = {
            "leads":[{
                "id_rd": lead.id,
                "id_exact": lead.id_exact,
                "email": lead.email,
                "lead_status": lead.lead_status,
                "lead_status_proba": lead.lead_status_proba
            }]
        };
        var url_victoria = process.env.VICTORIA_URL || '';
        var options = {
            url: url_victoria,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        };
        request(options, function (error, response, body) {
            if (error){
                console.log(error);
            } else {
                console.log('The lead with the email ' + lead.email + ' was sent do victoria. Status code: ' + response.statusCode);
            }
        });
    }

};