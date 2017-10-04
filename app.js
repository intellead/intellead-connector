var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var Dao = require('./src/Dao');
var LeadConversionData = require('./src/LeadConversionData');
var request = require('request');
var private_token_rd = process.env.PRIVATE_TOKEN_RD;
var private_token_exact = process.env.PRIVATE_TOKEN_EXACT;
var stage_lead = 0;
var stage_qualified_lead = 1;
var stage_client = 2;
var origin_digital = "digital";
var origin_intellead = "intellead";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

var questions = [
    "Tem interesse em contratar ferramenta de gestão?",
    "Estou a procura de um software de gestão para minha empresa!",
    "Gostaria de receber um contato do consultor para avaliação da ferramenta?",
    "Sim, eu gostaria de receber um contato do consultor para avaliação do software",
    "Quero uma demonstração de um software de gestão para minha empresa!",
    "Quero uma demonstração de um software de gestão para minha empresa! - Palestras",
    "Quero uma demonstração de um software de gestão para minha empresa! - Planilhas e Ebooks"
];

function is_a_qualified_lead_by_sla(lead, fit_score) {
    if (lead.lead_stage == "Lead" && has_fit_score(fit_score) && raised_hand(lead) && was_not_discarded(lead)) {
        return true;
    }
    return false;
}

function has_fit_score(fit_score) {
    return (fit_score == "a" || fit_score == "b");
}

function raised_hand(lead) {
    return (question_with_answer_yes(lead) ||
           (lead.last_conversion.content.identificador != undefined && lead.last_conversion.content.identificador.indexOf("levantada-mao") != -1) ||
           (lead.last_conversion.content.identificador != undefined && lead.last_conversion.content.identificador.indexOf("demonstracao") != -1) ||
           (lead.last_conversion.content.identificador != undefined && lead.last_conversion.content.identificador.indexOf("landing-page") != -1));
}

function was_not_discarded(lead) {
    return (lead.last_conversion.content.identificador == undefined || lead.last_conversion.content.identificador.indexOf("IntegracaoExact") == -1) && (lead.tags == undefined || lead.tags == null || (lead.tags != null && lead.tags.indexOf("descartadoexact") == -1));
}

function question_with_answer_yes(lead) {
    var arrayLength = questions.length;
    for (var i = 0; i < arrayLength; i++) {
        if (lead.last_conversion.content[questions[i]] == "Sim") {
            return questions[i];
        }
    }
}

function data_to_fit_score(lead) {
    var cargo = lead.last_conversion.content.cargo;
    var area = lead.last_conversion.content.Área;
    var segmento = lead.last_conversion.content.Segmento;
    var data_to_fit_score = {
        "cargo": cargo,
        "area": area,
        "segmento": segmento
    };
    return data_to_fit_score;
}

function doesnt_have_data_to_fit_score(data) {
    if (data == undefined || data == '' ||
        data.cargo == undefined || data.cargo == '' ||
        data.area == undefined || data.area == '' ||
        data.segmento == undefined || data.segmento == '') {
        return true;
    }
}

function qualified_by_intellead(lead_status) {
    if (lead_status != undefined && lead_status != null && lead_status != '' && lead_status == 1) {
        return true;
    }
    return false;
}

function change_the_lead_at_the_funnel_stage_to_qualified_in_rdstation(email) {
    var rd_url = process.env.RDSTATION_LEAD_STAGE_URL + '/' + email;
    var json_rd = {
        "auth_token": private_token_rd,
        "lead": {
            "lifecycle_stage": stage_qualified_lead
        }
    };
    request({ url: rd_url, method: 'PUT', json: json_rd}, function(error, response, body){
        if (error) {
            console.log(error);
            //send an email to sys admin
        } else {
            console.log('The lead with the email ' + email + ' had changed their stage in the funnel to qualified.');
        }
    });
}

function send_the_lead_to_exact_sales(lead, origem_exact) {
    var json_exact = {
        "Empresa": lead.company,
        "Contatos": [{
            "Email": lead.email,
            "Nome": lead.name,
            "Cargo": lead.job_title,
            "Tel1": lead.personal_phone
        }],
        "Origem": {
            "value": origem_exact
        },
        "TelEmpresa": lead.personal_phone,
        "CamposPersonalizados": [
            {
                "id": "_urlpublicardintellead",
                "value": lead.public_url
            }
        ]
    };
    var url_exact = process.env.EXACTSALES_INSERT_LEAD_URL_VALIDA_DUPLICIDADE;
    request({url: url_exact, method: 'POST', headers: {'Content-Type': 'application/json', 'token_exact': private_token_exact}, body: JSON.stringify(json_exact)}, function (error, response, body) {
        if (error){
            console.log(error);
            //send an email to sys admin
        } else {
            console.log('Status:', response.statusCode);
            console.log('Headers:', JSON.stringify(response.headers));
            console.log('Response:', body);
        }
    });
}

function save_lead_in_database(lead, fit_score) {
    var question = question_with_answer_yes(lead);
    var leadDTO = new LeadConversionData(lead, fit_score, question);
    var dao = new Dao();
    dao.saveConversion(leadDTO, function (err, result) {
        if (err) {
            console.log(err);
            //send an email to sys admin
        } else {
            console.log('The lead with email ' + lead.email + " was saved in database.");
        }
    });
}

function send_the_lead_to_intellead(data) {
    request({ url: process.env.DATA_WEBHOOK_URL, method: 'POST', json: data}, function(error, response, body) {
        if (error) {
            console.log(error);
            //send an email to sys admin
        } else {
            console.log('The lead was sent to intellead.');
        }
    });
}


app.post('/rd-webhook', function (req, res) {
    var body = req.body;
    if (!body) return res.sendStatus(400);
    var leads = body["leads"];
    for (var index in leads) {
        var lead = leads[index];
        console.log('The lead with email ' + lead.email + " has arrived.");
        var params_to_fit_score = data_to_fit_score(lead);
        if (doesnt_have_data_to_fit_score(params_to_fit_score)) {
            console.log('The variables to fit score are empty. Data: ' + params_to_fit_score);
            return res.sendStatus(200);
        }
        request({ url: process.env.FITSCORE_URL, method: 'POST', json: params_to_fit_score}, function(error, response, body2){
            if (error) {
                console.log(error);
                //send an email to sys admin
                return res.sendStatus(200);
            }
            var fit_score = body2;
            console.log('The lead with email ' + lead.email + ' has fit score: ' + fit_score);
            if (is_a_qualified_lead_by_sla(lead, fit_score)) {
                console.log('The lead with email ' + lead.email + " is qualified.");
                save_lead_in_database(lead, fit_score);
                change_the_lead_at_the_funnel_stage_to_qualified_in_rdstation(lead.email);
                send_the_lead_to_exact_sales(lead, origin_digital);
            } else {
                console.log('The lead with email ' + lead.email + " has not qualified according to SLA.");
                send_the_lead_to_intellead(body);
                console.log('The lead with email ' + lead.email + " was sent to intellead.");
            }
            return res.sendStatus(200);
        });
    }
});

app.post('/intellead-webhook', function (req, res) {
    console.log('entrou');
    var body = req.body;
    if (!body) return res.sendStatus(400);
    var leads = body["leads"];
    for (var index in leads) {
        var lead = leads[index];
        var qualified_intellead = qualified_by_intellead(lead.lead_status);
        if (lead.lead_stage == "Lead" && was_not_discarded(lead) && qualified_intellead && lead.lead_status_proba == '1.0' && lead.fit_score == 'a') {
            console.log('The lead with email ' + lead.email + " is qualified by intellead.");
            save_lead_in_database(lead, null);
            change_the_lead_at_the_funnel_stage_to_qualified_in_rdstation(lead.email);
            send_the_lead_to_exact_sales(lead, origin_intellead);
        }
    }
    return res.sendStatus(200);
});

app.get('/number_of_conversion_by_email', function(req, res, next) {
    var dao = new Dao();
    dao.numberOfConversionByEmail(function (err, result) {
        if (err) {
            return res.sendStatus(400);
        } else{
            return res.status(200).send(result);
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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
