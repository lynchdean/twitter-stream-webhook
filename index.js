const Discord = require('discord.js');
const Twit = require('twit');
const secrets = require('./secrets.json');
const follow = require('./follow.json');

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
    follow: follow.users
});
stream.on('tweet', function (tweet) {
    if (!isReply(tweet)) {
        console.log(`${tweet.user.name} - ${tweet.id}`);
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
    const user = tweet.user
    let embed = new Discord.MessageEmbed()
        .setColor('#1DA1F2')
        .setTitle('Link to tweet')
        .setURL(`https://twitter.com/${user.screen_name}/status/${tweet.id_str}`)
        .setAuthor(`${user.name} (@${user.screen_name})`, user.profile_image_url_https)
        .addField('Content:', tweet.text, false)

    const entities = tweet.entities
    entities.urls.forEach((obj) => {
            embed.addField(`url [ ${obj.display_url} ]:`, obj.expanded_url, false)
        }
    )
    if (entities.media) {
        embed.setImage(entities.media[0].media_url_https)
    }

    return embed
}




