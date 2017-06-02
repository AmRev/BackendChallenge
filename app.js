var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use(bodyParser.json());

Audit = require('./models/audit');

// Connect to Mongoose
mongoose.connect('mongodb://localhost/backbench');
var db = mongoose.connection;

// Active connection counts for each type.
var GET = 0;
var PUT = 0;
var POST = 0;
var DELETE = 0;

app.get('/process/*', function (req, res) {
    GET += 1;
    var audit = {
        time: Date.now(),
        method: 'GET',
        headers: req.headers,
        path: req.path,
        query: req.query,
        body: {},
        duration: ((Math.random() * 15) + 15) * 1000
    };
    Audit.addAudit(audit, function (err, audit) {
        if (err) {
            throw err;
        }
        setTimeout(function () {
            res.json(audit);
            GET -= 1;
        }, audit.duration);
    });
});

app.post('/process/*', function (req, res) {
    POST += 1;
    var audit = {
        time: Date.now(),
        method: 'POST',
        headers: req.headers,
        path: req.path,
        query: {},
        body: req.body,
        duration: ((Math.random() * 15) + 15)
    }
    Audit.addAudit(audit, function (err, audit) {
        if (err) {
            throw err;
        }
        setTimeout(function () {
            res.json(audit);
            POST -= 1;
        }, audit.duration * 1000);
    });
});

app.put('/process/*', function (req, res) {
    PUT += 1;
    var audit = {
        time: Date.now(),
        method: 'PUT',
        headers: req.headers,
        path: req.path,
        query: req.query,
        body: req.body,
        duration: ((Math.random() * 15) + 15)
    }
    Audit.addAudit(audit, function (err, audit) {
        if (err) {
            throw err;
        }
        setTimeout(function () {
            res.json(audit);
            PUT -= 1;
        }, audit.duration * 1000);
    });
});

app.delete('/process/*', function (req, res) {
    DELETE += 1;
    var audit = {
        time: Date.now(),
        method: 'DELETE',
        headers: req.headers,
        path: req.path,
        query: req.query,
        body: {},
        duration: ((Math.random() * 15) + 15)
    }
    Audit.addAudit(audit, function (err, audit) {
        if (err) {
            throw err;
        }
        setTimeout(function () {
            res.json(audit);
            DELETE -= 1;
        }, audit.duration * 1000);
    });
});

app.get('/stats', function (req, res) {
    Audit.getCount(function (err, noOfReq) {
        if (err) throw err;
        Audit.getAvgResponseTime(function (err, avgRespTime) {
            if (err) throw err;
            var time = Date.now()-3600000;
            Audit.getNoOfRequestsInPast(time, function(err, noOfReqInPastHour) {
                if (err) throw err;
                Audit.getAvgResponseTimeInPast(time, function(err, avgRespTimeInPastHour) {
                    if (err) throw err;
                    var time = Date.now()-60000;
                    Audit.getNoOfRequestsInPast(time, function(err, noOfReqInPastMin) {
                        if (err) throw err;
                        Audit.getAvgResponseTimeInPast(time, function(err, avgRespTimeInPastMin) {
                            if (err) throw err;

                            var audits = {
                                stat1: {
                                    noOfRequests: noOfReq,
                                    averageResponseTime: (avgRespTime.length == 1) ? avgRespTime[0].avg_resp
                                        : "0"
                                },
                                stat2: {
                                    noOfGETRequests: GET,
                                    noOfPUTRequests: PUT,
                                    noOfPOSTRequests: POST,
                                    noOfDELETERequests: DELETE
                                },
                                stat3: {
                                    noOfRequestsInPastHour: noOfReqInPastHour,
                                    averageResponseTimeInPastHour: (avgRespTimeInPastHour.length == 1) ?
                                        avgRespTimeInPastHour[0].avg_resp : 0
                                },
                                stat4: {
                                    noOfRequestsInPastMinute: noOfReqInPastMin,
                                    averageResponseTimeInPastMinute: (avgRespTimeInPastMin.length == 1) ?
                                        avgRespTimeInPastMin[0].avg_resp : 0
                                }
                            };
                            res.json(audits);
                        });
                    });
                });
            });
        });
    });
});

app.listen(3000);