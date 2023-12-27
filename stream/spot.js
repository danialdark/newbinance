const WebSocket = require('ws');
const Redis = require('ioredis');
const axios = require('axios');



const redis = new Redis({
    host: '91.107.160.210',
    port: '6379',
    password: 'D@n!@l12098',
    enableCompression: true,
});





const connectToBinance = async (symbol, index = 0) => {
    var onsStream = symbol;
    if (Array.isArray(symbol)) {
        onsStream = symbol[index];
        index++
    }

    console.log(`***start getting stream for ${onsStream}***`);

    const result = await startSpotStream(onsStream.toLowerCase());

    if (Array.isArray(symbol)) {
        if (symbol.length - 1 >= index) {
            if (result) {
                connectToBinance(symbol, index)
                console.log(`******************** done conntecting to binance stream  for ${onsStream} **************************`);
            }
        }
    } else {
        if (result) {
            console.log(`********************  done conntecting to binance stream  for ${onsStream} **************************`);
        }
    }
}



const startSpotStream = async (symbol) => {


    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@kline_1m`);


    ws.on('open', () => {
        console.log(`Connected to Binance 1m WebSocket.`);
    });

    ws.on('message', async (data) => {
        const tradeData = data.toString('utf-8');

        const parsedObj = JSON.parse(tradeData);
        const klineData = parsedObj.k;
        console.log(klineData)

        if (+klineData.l > 0) {
            const newCandle = {
                t: +klineData.t,
                T: +klineData.T,
                c: +klineData.c,
                h: +klineData.h,
                l: +klineData.l,
                o: +klineData.o,
                v: +klineData.v
            };


            // Save filteredData to Redis
            // redis.pipeline().set(`${symbol}`, JSON.stringify(filteredData)).exec();
        }

    });

    ws.on('close', () => {
        console.log(`Disconnected from Binance 1m WebSocket.`);
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });


};








startSpotStream("BTCUSDT")
// module.exports = connectToBinance;