const Discord = require('discord.js');
const secrets = require('./secrets.json');
const Twit = require('twit');

const webhookClient = new Discord.WebhookClient(secrets.discord.webhookID, secrets.discord.webhookToken);

const T = new Twit({
    consumer_key: secrets.twitter.consumer_key,
    consumer_secret: secrets.twitter.consumer_secret,
    access_token: secrets.twitter.access_token,
    access_token_secret: secrets.twitter.access_token_secret,
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL: true,     // optional - requires SSL certificates to be valid.
});


const stream = T.stream('statuses/filter', {
    follow: ['8973062', '1305530622576922624']
});
stream.on('tweet', function (tweet, err) {
    console.log(tweet);
    if (!isReply(tweet)) {
        webhookClient.send({
            username: 'PING! Monitor',
            embeds: [getTweetEmbed(tweet)],
        });
    }
})

function isReply(tweet) {
    if (tweet.retweeted_status
        || tweet.in_reply_to_status_id
        || tweet.in_reply_to_status_id_str
        || tweet.in_reply_to_user_id
        || tweet.in_reply_to_user_id_str
        || tweet.in_reply_to_screen_name)
        return true
}

function getTweetEmbed(tweet) {
    let embed = new Discord.MessageEmbed()
        .setColor('#1DA1F2')
        .setTitle('Link to tweet')
        .setURL(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
        .setAuthor(`${tweet.user.name} (@${tweet.user.screen_name})`, tweet.user.profile_image_url_https)
        .addField('Content:', tweet.text, false)

    const urls = tweet.text.match(/\bhttps?:\/\/\S+/gi);
    if (urls) {
        urls.forEach((value, index) =>
            embed.addField(`url [${index}]`, value, false)
        )
    }
    return embed
}




