var Promise         = require('bluebird');
var dns             = require('dns');
var smtp            = require('smtp-protocol');
var SMTPConnection  = require('smtp-connection');
var ping            = require('ping');

exports = module.exports = MagnisesDNS;

function MagnisesDNS(timeout, options) {
  if (!timeout)
    timeout = 20000;

  this.timeout = timeout;

  if (!options) options = { smtp: {} };

  if (!options.smtp.host) {
    options.smtp.host = 'localhost';
  }

  if (!options.smtp.port) {
    options.smtp.port = 9025;
  }

  this.options = options;
}

/**
 * Pings a server and returns a promise containing a number value of ms response time
 *
 * @param {string} subject host (e.g. 'google.com' or '127.0.0.1')
 * @returns {promise} number of ms passed since the first request
 *          (e.g. 251)
 */
MagnisesDNS.prototype.ping = function(host) {
  return new Promise((resolve, reject) => {
    if (!host) return reject(new Error('No hostname provided'));

    var resolved = false;
    var ms = 0;

    var timer = setInterval(() => {
      if (!resolved) {
        ms++;
      } else {
        clearInterval(timer);
      }
    }, 1);

    setTimeout(() =>  {
      ping.sys.probe(host, (alive) => {
        resolved = true;

        if (alive) {
          resolve(ms);
        }

        reject(new Error('Host Unreachable'));
      });
    });

    setTimeout(() => {
      resolved = true;
      reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

/**
 * Resolves a hostname (e.g. 'google.com') into the first found A (IPv4) or AAAA (IPv6) record.
 *
 * @param {string} subject hostname (e.g. 'google.com')
 * @param {number || object} options can be an object or integer. If options is not provided,
 *        then IP v4 and v6 addresses are both valid.
 * @returns {promise} address and family are part of the resolved object.
 *          (e.g. {address: '192.0.0.1',family: 4})
 */
MagnisesDNS.prototype.lookup = function(hostname, options) {
  return new Promise((resolve, reject) => {
    if(!hostname) return reject(new Error('No hostname provided'));

    dns.lookup(hostname, options, (err, address, family) => {
      if(err) return reject(err);

      resolve({
        address: address,
        family:  family
      });
    });

    setTimeout(() => {
      reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

/**
 * Resolves the given address and port into a hostname and service using getnameinfo
 *
 * @param {string} subject ip address (e.g. '127.0.0.1')
 * @param {number} the port number of the above ip address
 * @returns {promise} hostname and service arguments are part of the resolved object.
 *          (e.g. {hostname: 'localhost', service: 'http'})
 */
MagnisesDNS.prototype.lookupService = function(address, port) {
  if (!port) port = 80;

  return new Promise(function lookupServicePromise(resolve, reject) {

    dns.lookupService(address, port, function(err, hostname, service) {
      if(err) return reject(err);

      resolve({
        hostname: hostname,
        service: service
      });
    });

    setTimeout(() => {
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.resolve = function(hostname, rrtype) {
  return new Promise(function(resolve, reject) {

    var cb = function(err, addresses) {
      if(err) return reject(err);

      resolve(addresses);
    };

    if(!rrtype) {
      rrtype = cb;
      cb = null;
    }

    dns.resolve(hostname, rrtype, cb);

    setTimeout(() => {
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

/**
 * Resolves the given hostname into an ipv4 address
 *
 * @param {string} hostname of the given server (e.g. 'google.com')
 * @returns {Promise<array>} an array of assoicated ipv4 addresses
 */
MagnisesDNS.prototype.resolve4 = function(hostname) {
  return new Promise(function resolve4Promise(resolve, reject) {

    dns.resolve4(hostname, function(err, addresses) {
      if(err) return reject(err);

      resolve(addresses);
    });

    setTimeout(function() {
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

/**
 * Resolves the given hostname into an ipv6 address
 *
 * @param {string} hostname of the given server (e.g. 'google.com')
 * @returns {Promise<array>} an array of assoicated ipv6 addresses
 */
MagnisesDNS.prototype.resolve6 = function(hostname) {

};

MagnisesDNS.prototype.resolveCname = function(hostname) {
  return new Promise(function resolveCnamePromise(resolve, reject) {

    dns.resolveCname(hostname, function(err, addresses) {
      if(err) return reject(err);

      resolve(addresses);
    });

    setTimeout(function() {
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.resolveMx = function(hostname) {
  return new Promise(function resolveMxPromise(resolve, reject){

    dns.resolveMx(hostname, function(err, addresses){
      if(err) return reject(err);

      resolve(addresses);
    });

    setTimeout(function() {
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.resolveNs = function(hostname) {
  return new Promise(function resolveNsPromise(resolve, reject){

    dns.resolveNs(hostname, function(err, addresses){
      if(err) return reject(err);

      resolve(addresses);
    });

    setTimeout(function(){
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.resolveSoa = function(hostname) {
  return new Promise(function resolveSoaPromise(resolve, reject){

    dns.resolveSoa(hostname, function(err, addresses){
      if(err) return reject(err);

      resolve(addresses);
    });

    setTimeout(function(){
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.resolveSrv = function(hostname) {
  return new Promise(function resolveSrvPromise(resolve, reject){

    dns.resolveSrv(hostname, (err, addresses) => {
      if(err) return reject(err);

      resolve(addresses);
    });

    setTimeout(() => {
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.resolveTxt = function(hostname) {
  return new Promise(function resolveTxtPromise(resolve, reject){

    dns.resolveTxt(hostname, function(err, addresses){
      if(err) return reject(err);

      resolve(addresses);
    });

    setTimeout(() => {
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.reverse = function(ip) {
  return new Promise(function reversePromise(resolve, reject){

    dns.reverse(ip, function(err, hostnames){
      if(err) return reject(err);

      resolve(hostnames);
    });

    setTimeout(() => {
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.setServers = function(servers) {
  return new Promise(function setServersPromise(resolve, reject){

    dns.setServers(servers);

    resolve(true);

    setTimeout(function(){
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.getServers = function() {
  return new Promise(function getServersPromise(resolve, reject){
    resolve(dns.getServers());

    setTimeout(function(){
      return reject(new Error('Timeout Limit Reached'));
    }, this.timeout);
  });
};

MagnisesDNS.prototype.helo = function(remoteHost) {

  return new Promise(function heloPromise(resolve, reject){
    var server  = this._createSMTPServer();
    var connection;

    server
      .then(function(con) {
        connection = con;

        smtp.connect(this.options.smtp.host,  this.options.smtp.port, function(client) {

          if (!client) return reject(new Error('Unable to create smtp client'));

          client.helo(remoteHost, function(err, code, lines) {
            if (err) return resolve(false);

            client.quit();

            if (connection) {
              connection.close();
            }

            resolve({
              code: code,
              lines: lines
            });
          });

        }); //end smtp.connect

      })
      .catch(reject); //end smtp create.smtp server

    setTimeout(function() {
      if (server && server.close) {
        server.close();
      }

      if (connection && connection.close) {
        connection.close();
      }

      reject(new Error('Unable to connect'));
    }, this.timeout);
  });
};

/**
 * Tries a connection to an existing SMTP server on the localhost.
 * If no server exists, it will try creating one.
 */

MagnisesDNS.prototype._createSMTPServer = function (port) {

  var connection  = new SMTPConnection({
    host: this.options.smtp.host,
    port: this.options.smtp.port,
    connectionTimeout: 150
  });

  return new Promise(function _createSMTPServerPromise(resolve, reject) {
    if(!port)
      port = 9025;

    connection.on('error', function(err) {
      if (err.code === 'ETIMEDOUT') {
        createServerInstance();
      }
    });

    connection.on('connect', function(){
      resolve(false);
    });

    connection.connect();

    setTimeout(createServerInstance, this.timeout/4);

    function createServerInstance() {
      var server = smtp.createServer(function(){});

      server.on('error', function(e) {
        resolve(false);
      });

      server.listen(port, function(){
        resolve(server);
      });
    }

    setTimeout(function() {
      reject(new Error('Unable to create server instance in timely fassion'));
    }, this.timeout);
  })
  .finally(function(res) {

    //We want to close any open connections we've made
    connection.close();
    return Promise.resolve(res);
  });
};
