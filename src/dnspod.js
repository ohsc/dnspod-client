var util = require('util');
var EventEmitter = require('events').EventEmitter;
var HTTPS = require('https');
var querystring = require('querystring');
var net = require('net');

function Dnspod(params, options) {
    var self = this;
    self.defParams = mergeJSON({
        'login_email': '',
        'login_password': '',
        'format': 'json',
        'lang': 'cn',
        'error_on_empty': 'yes'
    }, params);

    self.defOptions = mergeJSON({
        host: 'dnsapi.cn',
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/json',
            'User-Agent': 'Node Dnspod Client/1.0.0'
        }
    }, options);
}

util.inherits(Dnspod, EventEmitter);

Dnspod.prototype.getHostIp = function(){
    var self = this;
    var message = '';

    var client = net.connect({
        host:'ns1.dnspod.net',
        port: 6666
    }, function() {
        // console.log('client connected');
    }).on('data', function(data){
        message = data.toString();
        // console.log(message);
        client.end();
    }).on('end', function(){
        // console.log('client disconnected');
        self.emit('getHostIp', null, message);
    });
};

Dnspod.prototype.request = function(url, params, eventListenerName){
    var self = this;
    var requestCallback = function(res) {
        var resData = [];
        res.on('data', function(data) {
            resData.push(data);
        }).on('end', function() {
            try {
                var jsonData = JSON.parse(resData.join(''));
                self.emit(eventListenerName, null, jsonData);
            } catch (ex) {
                self.emit(eventListenerName, new Error('Request failed'));
            }
        });
    };

    var postParams = self.defParams;
    if (params) {
        postParams = mergeJSON(postParams, params);
    }

    var postData = querystring.stringify(postParams);

    var postOptions = self.defOptions;
    postOptions.path = url;
    postOptions.headers['Content-Length'] = postData.length;

    var req = HTTPS.request(postOptions, requestCallback);
    req.write(postData);
    req.end();
    return req;
};

var mapper = {
    infoVersion: 'Info.Version',
    userDetail: 'User.Detail',
    userModify: 'User.Modify',
    userpasswdModify: 'Userpasswd.Modify',
    useremailModify: 'Useremail.Modify',
    telephoneverifyCode: 'Telephoneverify.Code',
    userLog: 'User.Log',
    domainCreate: 'Domain.Create',
    domainList: 'Domain.List',
    domainRemove: 'Domain.Remove',
    domainStatus: 'Domain.Status',
    domainInfo: 'Domain.Info',
    domainLog: 'Domain.Log',
    domainSearchenginepush: 'Domain.Searchenginepush',
    domainUrlincn: 'Domain.Urlincn',
    domainshareCreate: 'Domainshare.Create',
    domainshareList: 'Domainshare.List',
    domainshareModify: 'Domainshare.Modify',
    domainshareRemove: 'Domainshare.Remove',
    domainTransfer: 'Domain.Transfer',
    domainLock: 'Domain.Lock',
    domainLockstatus: 'Domain.Lockstatus',
    domainUnlock: 'Domain.Unlock',
    domainaliasList: 'Domainalias.List',
    domainaliasCreate: 'Domainalias.Create',
    domainaliasRemove: 'Domainalias.Remove',
    domaingroupList: 'Domaingroup.List',
    domaingroupCreate: 'Domaingroup.Create',
    domaingroupModify: 'Domaingroup.Modify',
    domaingroupRemove: 'Domaingroup.Remove',
    domainChangegroup: 'Domain.Changegroup',
    domainIsmark: 'Domain.Ismark',
    domainRemark: 'Domain.Remark',
    domainPurview: 'Domain.Purview',
    domainAcquire: 'Domain.Acquire',
    domainAcquiresend: 'Domain.Acquiresend',
    domainAcquirevalidate: 'Domain.Acquirevalidate',
    recordType: 'Record.Type',
    recordLine: 'Record.Line',
    recordCreate: 'Record.Create',
    recordList: 'Record.List',
    recordModify: 'Record.Modify',
    recordRemove: 'Record.Remove',
    recordDdns: 'Record.Ddns',
    recordRemark: 'Record.Remark',
    recordInfo: 'Record.Info',
    recordStatus: 'Record.Status',
    monitorListsubdomain: 'Monitor.Listsubdomain',
    monitorListsubvalue: 'Monitor.Listsubvalue',
    monitorList: 'Monitor.List',
    monitorCreate: 'Monitor.Create',
    monitorModify: 'Monitor.Modify',
    monitorRemove: 'Monitor.Remove',
    monitorInfo: 'Monitor.Info',
    monitorSetstatus: 'Monitor.Setstatus',
    monitorGethistory: 'Monitor.Gethistory',
    monitorUserdesc: 'Monitor.Userdesc',
    monitorGetdowns: 'Monitor.Getdowns'
};

for(key in mapper) {
    Dnspod.prototype[key] = (function(key, value) {
        return function(params){
            this.request('/' + value, params, key);
        };
    })(key, mapper[key]);
}


/*
* Recursively merge properties of two objects
*/
function mergeJSON(obj1, obj2) {

  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor==Object ) {
        obj1[p] = mergeJSON(obj1[p], obj2[p]);

      } else {
        obj1[p] = obj2[p];

      }

    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];

    }
  }

  return obj1;
}

module.exports = Dnspod;