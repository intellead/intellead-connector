var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();
var app = express();
var Dao = require('./src/Dao');
var LeadConversionData = require('./src/LeadConversionData');
var request = require('request');
var private_token_rd = process.env.PRIVATE_TOKEN_RD;
var private_token_exact = process.env.PRIVATE_TOKEN_EXACT;
var stage_lead = 0;
var stage_qualified_lead = 1;
var stage_client = 2;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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

app.use('/', router);

var questions = [
    "Tem interesse em contratar ferramenta de gestão?",
    "Estou a procura de um software de gestão para minha empresa!",
    "Gostaria de receber um contato do consultor para avaliação da ferramenta?",
    "Sim, eu gostaria de receber um contato do consultor para avaliação do software",
    "Quero uma demonstração de um software de gestão para minha empresa!",
    "Quero uma demonstração de um software de gestão para minha empresa! - Palestras",
    "Quero uma demonstração de um software de gestão para minha empresa! - Planilhas e Ebooks"
];

function is_a_qualified_lead(lead) {
    if (lead.lead_stage == "Lead" && has_fit_score(lead.fit_score) && raised_hand(lead) && was_not_discarded(lead)) {
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
    return (lead.last_conversion.content.identificador == undefined || lead.last_conversion.content.identificador.indexOf("IntegracaoExact") == -1) && (lead.tags == undefined || lead.tags == null || (lead.tags != null && lead.tags.indexOf("DescartadoExact") == -1));
}

function question_with_answer_yes(lead) {
    var arrayLength = questions.length;
    for (var i = 0; i < arrayLength; i++) {
        if (lead.last_conversion.content[questions[i]] == "Sim") {
            return questions[i];
        }
    }
}

// Route that receives a POST request to rd-webhook/
app.post('/rd-webhook', function (req, res) {
    var body = req.body;
    if (!body) return res.sendStatus(400);
    var leads = body["leads"];
    var dao = new Dao();
    for (var index in leads) {
        var lead = leads[index];
        if (is_a_qualified_lead(lead)) {
            var question = question_with_answer_yes(lead);
            var leadDTO = new LeadConversionData(lead.id, lead.email, lead.fit_score, question, new Date());
            dao.saveConversion(leadDTO, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(400);
                }
                var rd_url = 'https://www.rdstation.com.br/api/1.2/leads/'+lead.email;
                json_rd = {
                    "auth_token": private_token_rd,
                    "lead": {
                        "lifecycle_stage": stage_qualified_lead
                    }
                };
                request({ url: rd_url, method: 'PUT', json: json_rd}, function(error, request, body){
                    if (error) {
                        console.log(error);
                        return res.sendStatus(400);
                    } else {
                        json_exact = {
                            "Empresa": lead.company,
                            "Contatos": [{
                                "Email": lead.email,
                                "Nome": lead.name,
                                "Cargo": lead.job_title,
                                "Tel1": lead.personal_phone
                            }],
                            "Origem": {
                                "value": "testeferramenta"
                            },
                            "TelEmpresa": lead.personal_phone
                        };
                        var url_exact = 'https://api.spotter.exactsales.com.br/api/v2/leads';
                        console.log(url_exact);
                        console.log(private_token_exact);
                        console.log(JSON.stringify(json_exact));
                        request({url: url_exact, method: 'POST', headers: {'Content-Type': 'application/json', 'token_exact': private_token_exact}, body: JSON.stringify(json_exact)}, function (error, response, body) {
                            console.log('Entrou na request');
                            if (error){
                                console.log(error);
                                console.log('Entrou no error');
                                return res.sendStatus(400);
                            } else {
                                console.log('Entrou na sucesso');
                                console.log('Status:', response.statusCode);
                                console.log('Headers:', JSON.stringify(response.headers));
                                console.log('Response:', body);
                                res.sendStatus(200);
                            }
                        });
                    }
                });
            });
        } else {
            return res.sendStatus(200);
        }
    }
});

router.get('/rd-webhook', function(req, res, next) {
    res.sendStatus(200);
});

router.get('/number_of_conversion_by_email', function(req, res, next) {
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
