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
var configFile = process.argv[2];
var AWS = require('aws-sdk');
var config;

if (!configFile) {
  console.log('Missing config');
  process.exit(-1);
}

AWS.config.loadFromPath(configFile);
config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

console.log('testing...');

var r53 = new AWS.Route53();

// nodescale.com
var params = {
  HostedZoneId: 'Z38MILY3GUT2Z0',
  MaxItems: '100',
  /*
  StartRecordIdentifier: 'STRING_VALUE',
  StartRecordName: 'STRING_VALUE',
  StartRecordType: 'SOA | A | TXT | NS | CNAME | MX | PTR | SRV | SPF | AAAA'
  */
};

r53.listResourceRecordSets(params, function(err, data) {
  if (err) {
    console.log(err, err.stack);
  }
  else {
    console.log(JSON.stringify(data, null, 2));
  }
});

console.log('---------------------------------------');

var change = {ChangeBatch: {Changes: [
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: 'demo.nodezoo.info',
          Type: 'A',
          AliasTarget: {
            DNSName: 'webElb-1432778970.us-west-2.elb.amazonaws.com',
            EvaluateTargetHealth: false,
            HostedZoneId: 'Z33MTJ483KN6FU'
          },
        },
      }
    ],
    Comment: 'no comment'
  },
  HostedZoneId: 'Z38MILY3GUT2Z0'
};

/*
var change = {ChangeBatch: {Changes: [
      {
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: 'demo.nodezoo.info',
          Type: 'A',
          AliasTarget: {
            DNSName: 'sudc-bal-1117399678.us-west-2.elb.amazonaws.com',
            EvaluateTargetHealth: false,
            HostedZoneId: 'Z33MTJ483KN6FU'
          },
        },
      }
    ],
    Comment: 'no comment'
  },
  HostedZoneId: 'Z38MILY3GUT2Z0'
};
*/


r53.changeResourceRecordSets(change, function(err, data) {
  if (err) {
    console.log(err, err.stack);
  }
  else {
    console.log(JSON.stringify(data, null, 2));
  }
});


/*

var change = {ChangeBatch: {Changes: [
      {
        Action: 'CREATE',
        ResourceRecordSet: {
          Name: 'demo.nodescale.info',
          Type: 'A',
          AliasTarget: {
            DNSName: 'webElb-1432778970.us-west-2.elb.amazonaws.com',
            EvaluateTargetHealth: false,
            HostedZoneId: 'Z33MTJ483KN6FU'
          },
          ResourceRecords: [
            {
              Value: 'STRING_VALUE'
            }
          ],
          Region: 'us-west-2',
          SetIdentifier: 'wibble',
          TTL: 0,
          Weight: 0
        },
      }
    ],
    Comment: 'no comment'
  },
  HostedZoneId: 'Z38MILY3GUT2Z0'
};

*/

