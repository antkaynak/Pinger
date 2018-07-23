'use strict';
const ping = require('ping');
const Email = require('email-templates');
const nodemailer = require('nodemailer');
var argv = require('minimist')(process.argv.slice(2));


console.log(argv);
const host = argv.host;
const from = argv.from;
const password = argv.password;
const to = argv.to;

if(host == undefined || from == undefined || password == undefined || to === undefined){
    return console.log('Invalid params. Usage --host ip --from emailfrom --password emailpassword --to emailto');
}

let pingCount = 1;
let intervalCount = 15000;
let resetIntervalCount = 60000;

const email = new Email({
    message: {
      from: from
    },
    // uncomment below to send emails in development/test env:
    send: true,
    transport: {
      jsonTransport: true
    }
  });


let pingUrl = function() {
    ping.sys.probe(host, function(isAlive){
        var msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead ' + pingCount;
        if(!isAlive){
            if(pingCount > 4){
        
                
                email
                .send({
                template: 'mars',
                message: {
                to: to
                },
                locals: {
                name: 'User'
                }
                })
                .then(res => {
                    console.log('res.originalMessage', res.originalMessage);

                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                               user: from,
                               pass: password
                           }
                       });

                
                        let mailOptions = res.originalMessage;
                    
                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log(info);
                        
                        });

                })
                .catch(console.error);
                pingCount = 1;
                intervalCount = 15000;
                setTimeout(pingUrl, resetIntervalCount);
                return console.log('ALERT!');
            }
            pingCount++;
            intervalCount = Math.round(intervalCount / pingCount);
        }else{
            intervalCount = 15000;
            pingCount = 1;
        }

        setTimeout(pingUrl, intervalCount);
        console.log(msg);
    });
}

let pingOut = setTimeout(pingUrl, intervalCount);

