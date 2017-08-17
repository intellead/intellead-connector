'use strict';

class LeadConversionData {

    constructor(lead, fit_score, question) {
        this._id_rd_station = lead.id;
        this._email = lead.email;
        this._fit_score = fit_score;
        this._question = question;
        this._date = new Date();
        this._created_at = lead.last_conversion.created_at;
        this._name = lead.last_conversion.content.nome;
        this._identifier = lead.last_conversion.content.identificador;
        this._source = lead.last_conversion.conversion_origin.source;
        this._medium = lead.last_conversion.conversion_origin.medium;
        this._campaign = lead.last_conversion.conversion_origin.campaign;
        this._telephone = lead.last_conversion.content.telefone;
        this._job_title = lead.last_conversion.content.cargo;
        this._area = lead.last_conversion.content.Área;
        this._segment = lead.last_conversion.content.Segmento;
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

    set created_at(created_at) {
        this._created_at = created_at;
    }

    get created_at() {
        return this._created_at;
    }

    set name(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    set identifier(identifier) {
        this._identifier = identifier;
    }

    get identifier() {
        return this._identifier;
    }

    set source(source) {
        this._source = source;
    }

    get source() {
        return this._source;
    }

    set medium(medium) {
        this._medium = medium;
    }

    get medium() {
        return this._medium;
    }

    set campaign(campaign) {
        this._campaign = campaign;
    }

    get campaign() {
        return this._campaign;
    }

    set telephone(telephone) {
        this._telephone = telephone;
    }

    get telephone() {
        return this._telephone;
    }

    set job_title(job_title) {
        this._job_title = job_title;
    }

    get job_title() {
        return this._job_title;
    }

    set area(area) {
        this._area = area;
    }

    get area() {
        return this._area;
    }

    set segment(segment) {
        this._segment = segment;
    }

    get segment() {
        return this._segment;
    }

}

module.exports = LeadConversionData;