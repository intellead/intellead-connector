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
var private_token_rd = process.env.PRIVATE_TOKEN_RD;
const LEAD_IN_QUALIFIED_STAGE = 1;

module.exports = {

    change_the_lead_at_the_funnel_stage_to_qualified: function(email) {
        var rd_station_lead_stage_url = process.env.RDSTATION_LEAD_STAGE_URL || '';
        var rd_url = rd_station_lead_stage_url + '/' + email;
        var data = {
            "auth_token": private_token_rd,
            "lead": {
                "lifecycle_stage": LEAD_IN_QUALIFIED_STAGE
            }
        };
        request({ url: rd_url, method: 'PUT', json: data}, function(error, response, body){
            if (error) {
                console.log(error);
            } else {
                console.log('The lead with the email ' + email + ' had changed their stage in the funnel to qualified.');
            }
        });
    }

};