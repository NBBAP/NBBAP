const { MongoClient } = require('mongodb');
const uri: string = "mongodb+srv://NBBAP:NBBAP1998@cluster0.wzjkt.mongodb.net/ITproject?retryWrites=true&w=majority";
const client = new MongoClient(uri, {  useUnifiedTopology: true});

/* interface Onderneming {
    name : string,
    adres : string,
    datumneerleging : string,
    eigenvermogen : number,
    bedrijfsWinst : number
}
const main = async() => {
    try {
    await client.connect();

    let onderneming : Onderneming[] = [
        {name:"Ap",adres:"meerstraat 15",datumneerleging:"15/02/2018",eigenvermogen:50000,bedrijfsWinst:5000},
        {name:"Ap1",adres:"meerstraat 75",datumneerleging:"15/02/2020",eigenvermogen:50000,bedrijfsWinst:5000},
        {name:"Ap1",adres:"meerstraat 125",datumneerleging:"15/02/2020",eigenvermogen:50000,bedrijfsWinst:5000}

    ];

    let result = await client.db('ITproject').collection('Onderneming').insertMany(onderneming);
    console.log(result.insertedCount);
    console.log(result.insertedIds);
 

    }
    catch(e) {
        console.error(e);
    }
    finally {
        await client.close();
    }
}

main();
*/

//  INIT & SETUP


const uuidv8 = require("uuid/v8");
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('port', 3000);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended:true}));
app.use('/public/', express.static('./public'));

//  ondernemingen interface + objecten

interface Onderneming {
    name: string,
    address: string,
    datumNeerlegging: string,
    eigenVermogen: number,
    schulden: number,
    bedrijfsWinst: number
}

const bedrijven:Onderneming[] = [
    {
        name: "IT bedrijf 1",
        address: "Computerstraat 12",
        datumNeerlegging: "10-20-2020",   
        eigenVermogen: 11234,
        schulden: 21938,
        bedrijfsWinst: 42465
    },
    {
        name: "IT bedrijf 2",
        address: "Pcstraat 42b",
        datumNeerlegging: "02-01-2021",      
        eigenVermogen: 50234,
        schulden: 9506,
        bedrijfsWinst: 454541
    }
]

//  FUNCTIONS

const GetApiUrl = (referenceNumber: string) => {

    //basisurl + referencenummer
    let env = `ws.uat2.cbso.nbb.be`;
    let apiName = `authentic`;
    let operation = `deposit/${referenceNumber}/accountingData`;
    
    //query's
    let subKey = `091539ea0adb414d9eb51977a6afd3a8`;
    let reqId = "1234567890123456";
    let accept = "application/json";

    //FullUrl with query's
    let apiUrl = `https://${env}/${apiName}/${operation}?NBB-CBSO-Subscription-Key=${subKey}&X-Request-Id=${reqId}&Accept=${accept}`;
    return apiUrl;
}

//  ROUTES

app.get('/', (req:any, res:any) => {
    res.render('index');
});

app.post('/', (req:any, res:any) => {
    let data = req.body;

    //  api call met beide kbonummers
    //      const resp = await fetch(apiUrl)
    //      const bedrijven = resp.json();

    //  object aanmaken voor beide ondernemingen
    //  opslagen in database en output geven
    
    //res.json(bedrijven);

    res.render('vergelijking', {bedrijven: bedrijven}, 
    );
});


app.get('/about', (req:any, res:any) =>{
    res.render('about');
});

app.get('/contact', (req:any, res:any) => {
    res.render('contact');
});

//  AP STARTUP

app.listen(app.get('port'), ()=>console.log( `[server] http://localhost:` + app.get('port')));

//  last
app.use((req:any, res:any) => {
    res.status(404).render('index');
})