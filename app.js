'use strict';
const ping = require('ping');
const Email = require('email-templates');
const nodemailer = require('nodemailer');




const host = 'google.com';
let pingCount = 1;
let intervalCount = 15000;
let resetIntervalCount = 60000;

const email = new Email({
    message: {
      from: 'keyistapp@gmail.com'
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
                to: 'email@gmail.com'
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
                               user: 'email@gmail.com',
                               pass: 'password'
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

