/**
 * Created by amrev on 28/05/17.
 */
var mongoose = require('mongoose');

var auditSchema = mongoose.Schema({
    //time when the request was received,
    time: {
        type: Date,
        required: true
    },
    //HTTP method used for making the request
    method: {
        type: String,
        required: true
    },
    //HTTP headers in the request
    headers: {
        type: JSON,
        required: true
    },
    //request path (will start with /process)
    path: {
        type: String,
        required: true
    },
    //the parsed query string as key-values, if any
    query: {
        type: JSON
    },
    //request body, if any
    body: {
        type: JSON
    },
    //time taken to process the request
    duration: {
        type: Number,
        required: true
    }
});

var Audit = module.exports = mongoose.model('Audit', auditSchema);

// Get Audits
module.exports.getAudits = function (callback, limit) {
    Audit.find(callback).limit(limit);
}

// Get Audit
module.exports.getAuditById = function(id, callback) {
    Audit.findById(id, callback);
}

// Add Audit
module.exports.addAudit = function(audit, callback) {
    Audit.create(audit, callback);
}

// Update Audit
module.exports.updateAudit = function(id, audit, options, callback) {
    var query = {_id: id};
    var update = {
        time: audit.time,
        method: audit.method,
        headers: audit.headers,
        path: audit.path,
        query: audit.query,
        body: audit.body,
        duration: audit.duration
    }
    Audit.findOneAndUpdate(query, update, options, callback);
}

// Delete Audit
module.exports.deleteAudit = function(id, callback) {
    var query = {_id: id};
    Audit.remove(query, callback);
}

// Get Stats
module.exports.getStats = function(callback) {
    var stats = {
        noOfRequests: Audit.count()
    };
}

// Get Stats 1
module.exports.getCount = function(callback) {
    Audit.count(callback);
}
module.exports.getAvgResponseTime = function(callback) {
    Audit.aggregate({
        "$group": {
            "_id": null,
            "avg_resp": {
                $avg: "$duration"
            }
        }
    }, callback);
}

// Get Stats 3 & 4
module.exports.getNoOfRequestsInPast = function (time, callback) {
    Audit.find({
        "time": {
            "$gte": time
        }
    }).count(callback);
}
module.exports.getAvgResponseTimeInPast = function (time, callback) {
    Audit.aggregate([
        {
            $match: {
                time: {
                    $gte: new Date(time)
                }
            }
        },
        {
            $group: {
                _id: null,
                avg_resp: {
                    $avg: "$duration"
                }
            }
        }], callback);
}