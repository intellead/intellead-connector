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
var private_token_exact = process.env.PRIVATE_TOKEN_EXACT;

module.exports = {

    insert_lead: function(email, name, company, job_title, personal_phone) {
        var lead_data = {
            "Empresa": company,
            "Contatos": [{
                "Email": email,
                "Nome": name,
                "Cargo": job_title,
                "Tel1": personal_phone
            }],
            "Origem": {
                "value": "intellead"
            },
            "TelEmpresa": personal_phone
        };
        var exact_sales_insert_lead_url = process.env.EXACTSALES_INSERT_LEAD_URL || '';
        var options = {
            url: exact_sales_insert_lead_url,
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'token_exact': private_token_exact},
            body: JSON.stringify(lead_data)
        };
        request(options, function (error, response, body) {
                if (error){
                    console.log(error);
                    console.log('Response:', body);
                } else {
                    console.log('Status:', response.statusCode);
                    console.log('Headers:', JSON.stringify(response.headers));
                    console.log('Response:', body);
                }
        });
    }

};