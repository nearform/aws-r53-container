#! /usr/bin/env node
/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    config: 'c',
    from: 'f',
    to: 't'
  }
});
var config = argv.config;
var fromEnv = argv.from;
var toEnv = argv.to;
var AWS = require('aws-sdk');

function lookUpEnvironment(env, cb) {
  // TODO refactor to look these up from disk and the analyzer
  if (env === 'blue') {
    cb(null, {
      name: env,
      // needs to be looked up by the analyzer
      elb: 'webElb-1432778970.us-west-2.elb.amazonaws.com',
      // needs to be looked up by the analyzer
      hostedZoneId: 'Z33MTJ483KN6FU',
      // needs to be in the <env>.json file
      domain: 'demo.nodezoo.info',
    });
  } else if (env === 'green') {
    cb(null, {
      name: env,
      // needs to be looked up by the analyzer
      elb: 'sudc-bal-1117399678.us-west-2.elb.amazonaws.com',
      // needs to be looked up by the analyzer
      hostedZoneId: 'Z33MTJ483KN6FU',
      // needs to be in the <env>.json file
      domain: 'demo.nodezoo.info'
    });
  } else {
    cb(new Error('no such environment'));
  }
}

if (!config && !fromEnv && !toEnv) {
  console.log('Usage: switch.js -c <aws-config> -f <current environment> -t <destination environment>')
  process.exit(1)
}

AWS.config.loadFromPath(config);

var route53 = new AWS.Route53();

function handleError(err) {
  if (err) {
    console.log(err.message || err.code)
    process.exit(1)
  }
}

lookUpEnvironment(fromEnv, function(err, fromEnv) {
  handleError(err);
  lookUpEnvironment(toEnv, function(err, toEnv) {
    handleError(err);

    if (fromEnv.domain !== toEnv.domain) {
      handleError(new Error('domains in the environments do not match'))
    }

    var params = {
      MaxItems: '100'
    };

    route53.listHostedZones(params, function(err, data) {
      if (err) {
        handleError(err)
      }

      var zone = data.HostedZones.filter(function(zone) {
        var domain = zone.Name.replace(/\.$/, '')
        return fromEnv.domain.indexOf(domain) >= 0
      })[0];

      if (!zone) {
        handleError(new Error('domain ' + fromEnv.domain + ' is not managed by route53'));
      }

      var id = zone.Id.replace('/hostedzone/', '');

      var change = {
        ChangeBatch: {
          Changes: [{
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: fromEnv.domain,
                Type: 'A',
                AliasTarget: {
                  DNSName: toEnv.elb,
                  EvaluateTargetHealth: false,
                  HostedZoneId: toEnv.hostedZoneId
                },
              }
          }],
          Comment: 'Update to ' + toEnv.elb + ' done at ' + new Date().toISOString()
        },
        HostedZoneId: id
      };

      route53.changeResourceRecordSets(change, function(err, data) {
        if (err) { handleError(err) }

        var params = {
          HostedZoneId: id
        };

        route53.listResourceRecordSets(params, function(err, data) {
          if (err) {
            handleError(err)
          }
          var rrs = data.ResourceRecordSets.filter(function(rrs) {
            var current = rrs.Name.replace(/\.$/, '');
            var check = fromEnv.domain.replace(/\.$/, '');
            return current === check;
          })[0];

          console.log('Resulting ResourceRecordSet', JSON.stringify(rrs, null, 2));
        });
      });
    });
  })
})
