var Dnspod = require('../');



describe('Domain', function(){
    it('should return -1 when login failed', function(done){
        var client = new Dnspod({
            'login_email': 'test@test.com',
            'login_password': 'test'
        });

        client.on('domainList',function(err, data){
            if (err) {
                throw err;
            } else {
                done();
            }
        }).domainList({length:5});
    });
});

describe('IP', function(){
    it('shound return ip address', function(done){
        var client = new Dnspod({
            'login_email': 'test@test.com',
            'login_password': 'test'
        });

        client.on('getHostIp', function(err, message){
            if (err) {
                throw err;
            } else {
                console.log('get IP address: ' + message);
                done();
            }
        }).getHostIp();
    });
});