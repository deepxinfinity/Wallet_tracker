const axios = require('axios')
const Discord = require('discord.js');
const config = require('./config.json');
const { Client, GatewayIntentBits, EmbedBuilder, WebhookClient } = require('discord.js');


const wallet = config.wallet
const name = config.name
const webhook = config.webhook
const apikey = config.api_key


//API Configure
const api_url = "https://api.helius.xyz/v0/addresses"
const resource = "nft-events"
const options = `api-key=api_key`
//"wallet": "FQDbLy5PnP511ZTNj4KrTPo2WnKdsciFwGpkRevw69K4",
const webhookClient = new WebhookClient({ url: webhook });

//Empty var for most recent TX
let most_recent = ""

//Wallet Vars
let latest = ""
let temp = ""
let run_count = 0

const init = async () => {
    try {
        const { data } = await axios.get(`${api_url}/${wallet}/${resource}?${options}&until=${most_recent}`)
        latest = data[0].description
        temp = data[0].description
        console.log("Initialized Monitor -> Listnening for TX Events: Most Recent List: " + latest.replace(wallet, name))
    }
    catch (err) {
        console.log(err)
    }
}

const monitor = async () => {
    try {
        const { data } = await axios.get(`${api_url}/${wallet}/${resource}?${options}&until=${most_recent}`)
        latest = data[0].description
        mint = data[0].nfts[0].mint
        image_url = await getImage(mint)
        buyer = data[0].buyer
        seller = data[0].seller
        console.log(image_url)
        if (latest !== temp && run_count != 0) {
            const embed = new EmbedBuilder()
                .setTitle(`New Transaction`)
                .setDescription(`${latest.replace(wallet, name)}`)
                .setAuthor({ name: 'DEEPXINFINITY', iconURL: 'https://img.icons8.com/nolan/512/visible.png' })
                .setColor(0x00AE86)
                .setThumbnail(image_url)
                .addFields(
                    { name: 'Buyer', value: `[Click](https://solana.fm/address/${buyer}?cluster=mainnet-genesysgo)`, inline: true },
                    { name: 'Seller', value: `[Click](https://solana.fm/address/${seller}?cluster=mainnet-genesysgo)`, inline: true },
                    { name: 'Transaction', value: `[Click](https://www.solana.fm/tx/${data[0].signature}?cluster=mainnet-genesysgo)`, inline: true }
                )


            webhookClient.send({ embeds: [embed] });
            temp = latest
        }
    }
    catch (err) {
        console.log(err)
    }
}

const getImage = async (mint) => {
    try {
        const url = "https://api.helius.xyz/v0/tokens/metadata?api-key=api_key"
        const nftAddresses = [
            mint,
        ]
        const { data } = await axios.post(url, { mintAccounts: nftAddresses })
        let image = data[0].offChainData.image
        if (image === undefined) {
            image = ""
        }
        return image
    }
    catch (err) {
        console.log(err)
    }
}

function setTerminalTitle(title) {
    process.stdout.write(
        String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
    );
}

const startMonitor = async () => {
    try {
        monitor()
        run_count++
    }
    catch (err) {
        console.log(err)
    }

}

async function main() {
    console.clear()
    setTerminalTitle(` - ${name} - ${wallet}`)
    init()

    setInterval(startMonitor, 150000)
}

main()