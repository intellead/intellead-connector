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
    "Gostaria de receber um contato do consultor para avaliação da ferramenta?"
];

function is_a_qualified_lead(lead) {
    if (lead.lead_stage == "Lead" && (lead.fit_score == "a" || lead.fit_score == "b") && question_with_answer_yes(lead)) {
        console.log("LEAD_STAGE: " + lead.lead_stage);
        console.log("FIT_SCORE: " + lead.fit_score);
        return true;
    }
    return false;
}

function question_with_answer_yes(lead) {
    var arrayLength = questions.length;
    for (var i = 0; i < arrayLength; i++) {
        if (lead.last_conversion[questions[i]] == "Sim") {
            console.log("QUESTÃO COM SIM: " + questions[i]);
            return questions[i];
        }
    }
}

// Route that receives a POST request to rd-webhook/
app.post('/rd-webhook', function (req, res) {
    console.log("[rd-webhook]ENTROU");
    var body = req.body;
    if (!body) return res.sendStatus(400);
    var leads = body["leads"];
    var dao = new Dao();
    for (var index in leads) {
        var lead = leads[index];
        console.log(lead);
        if (is_a_qualified_lead(lead)) {
            //SEND TO EXACTSALES
            console.log("EH QUALIFICADO");
            var question = question_with_answer_yes(lead);
            var leadDTO = new LeadConversionData(lead.id, lead.email, lead.fit_score, question, new Date());
            console.log("LEADDTO: " + leadDTO);
            new dao.saveConversion(leadDTO, function (err, result) {
                if (err) {
                    return res.sendStatus(400);
                }
                res.sendStatus(200);
            });
        } else {
            return res.sendStatus(200);
        }
    }
});

router.get('/rd-webhook', function(req, res, next) {
    res.sendStatus(200);
});

app.post('/number_of_conversion_by_email', function (req, res) {
    console.log("[number_of_conversion_by_email]ENTROU");
    var dao = new Dao();
    new dao.numberOfConversionByEmail(function (err, result) {
        if (err) {
            return res.sendStatus(400);
        }
        return res.status(200).send(result);
    });
});

router.get('/number_of_conversion_by_email', function(req, res, next) {
    res.sendStatus(200);
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
