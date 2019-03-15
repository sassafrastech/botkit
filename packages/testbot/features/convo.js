const { BotkitConversation } = require('botkit');


module.exports = function(controller) {
    const DIALOG_ID = 'welcome_dialog';
    const welcome = new BotkitConversation(DIALOG_ID, controller);

    welcome.say('Hey!');
    welcome.say('What is up??');
    welcome.ask('what is your name', async (answer, convo, bot) => {
        // noop
        // answer contains the user's answer
        // as does convo.vars.name
    },{key: 'name'});

    welcome.say('hrrm!');
    welcome.say('ok, {{vars.name}}!');
    welcome.ask('yes or no', [
        {
            pattern: 'yes',
            handler: async function(answer, convo, bot) {
                console.log('YES HANDLER');
                console.log(convo);
                return await convo.gotoThread('foo');
            }
        },
        {
            pattern: 'no',
            handler: async function(answer, convo, bot) { 
                console.log(' NO HANDLER');
                return await convo.gotoThread('bar');
            }
        },
        {
            default: true,
            handler: async (answer, convo, bot) => {
                console.log('FALLBACK HANDLER');
                // do nothing
            }
        }
    ], {key: 'answer'});

    welcome.say('HUH WHAT DOES {{vars.answer}} MEAN?');

    welcome.addMessage('YES!!! {{vars.foo}} {{vars.bar}}','foo');
    welcome.addMessage('NOOOOOO', 'bar');

    welcome.before('foo', async(convo, bot) => {
        // set a variable
        convo.vars.foo = 'this was set in a before handler!';
    });

    welcome.before('bar', async(convo, bot) => {

        // redirect the thread
        convo.vars.bar = 'YOU HAVE BEEN REDIRECTED HERE.';

        // you can send adhoc messages you want using bot.say
        bot.say('I refuse to accept that answer.');

        await convo.gotoThread('foo');
    });

    welcome.after(async(results, bot) => {
        console.log('welcome completed', results);
        // await bot.beginDialog('tacos');
    });

    // controller.cms.after('tacos', async(results, bot) => {
    //     console.log('AFTER TACOS!!!!!!');
    //     await bot.beginDialog('menu'); 
    // });

    controller.dialogSet.add(welcome);
    controller.hears(['welcome'],'message', async (bot, message) => {
        await bot.beginDialog(DIALOG_ID);
    });

    controller.on('conversationUpdate', async(bot, message) => {
        // check to see if this is the bot or another user.
        var is_bot = message.incoming_message.membersAdded.filter((member) => {
            return (member.id === message.incoming_message.recipient.id);
        })
        if (is_bot.length===0) {
            await bot.beginDialog(DIALOG_ID);
        }
    });

}