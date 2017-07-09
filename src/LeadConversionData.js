'use strict';

class LeadConversionData {

    constructor(id_rd_station, email, fit_score, question, date) {
        this._id_rd_station = id_rd_station;
        this._email = email;
        this._fit_score = fit_score;
        this._question = question;
        this._date = date;
    }

    set id_rd_station(id_rd_station) {
        this._id_rd_station = id_rd_station;
    }

    get id_rd_station() {
        return this._id_rd_station;
    }

    set email(email) {
        this._email = email;
    }

    get email() {
        return this._email;
    }

    set fit_score(fit_score) {
        this._fit_score = fit_score;
    }

    get fit_score() {
        return this._fit_score;
    }

    set question(question) {
        this._question = question;
    }

    get question() {
        return this._question;
    }

    set date(date) {
        this._date = date;
    }

    get date() {
        return this._date;
    }

}

module.exports = LeadConversionData;