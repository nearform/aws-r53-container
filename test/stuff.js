

var params = {
  ChangeBatch: { /* required */
    Changes: [ /* required */
      {
        Action: 'CREATE | DELETE | UPSERT', /* required */
        ResourceRecordSet: { /* required */
          Name: 'STRING_VALUE', /* required */
          Type: 'SOA | A | TXT | NS | CNAME | MX | PTR | SRV | SPF | AAAA', /* required */
          AliasTarget: {
            DNSName: 'STRING_VALUE', /* required */
            EvaluateTargetHealth: true || false, /* required */
            HostedZoneId: 'STRING_VALUE' /* required */
          },
          Failover: 'PRIMARY | SECONDARY',
          GeoLocation: {
            ContinentCode: 'STRING_VALUE',
            CountryCode: 'STRING_VALUE',
            SubdivisionCode: 'STRING_VALUE'
          },
          HealthCheckId: 'STRING_VALUE',
          Region: 'us-east-1 | us-west-1 | us-west-2 | eu-west-1 | eu-central-1 | ap-southeast-1 | ap-southeast-2 | ap-northeast-1 | sa-east-1 | cn-north-1',
          ResourceRecords: [
            {
              Value: 'STRING_VALUE' /* required */
            },
            /* more items */
          ],
          SetIdentifier: 'STRING_VALUE',
          TTL: 0,
          Weight: 0
        }
      },
      /* more items */
    ],
    Comment: 'STRING_VALUE'
  },
  HostedZoneId: 'STRING_VALUE' /* required */
};
route53.changeResourceRecordSets(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

