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

const fetch = require('node-fetch');
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

//  ROUTES

app.get('/', (req:any, res:any) => {
    res.render('index');
});

app.post('/', (req:any, res:any) => {

    // legen objecten aanmaken en fetch promises

    let woord = "origineel";

    let onderneming1: any = {};
    let onderneming2: any = {};

    let onderneming1Cijfers: any = {};
    let onderneming2Cijfers: any = {};

    

    let promise1 = fetch(`https://ws.uat2.cbso.nbb.be/authentic/legalEntity/${req.body.ondernemingsnummer1}/references`,{
        headers:{
            'Accept' : 'application/json',
            'NBB-CBSO-Subscription-Key' : '091539ea0adb414d9eb51977a6afd3a8',
            'X-Request-Id' :''
            }}).then((response:any)=> response.json());;

    let promise2 = fetch(`https://ws.uat2.cbso.nbb.be/authentic/legalEntity/${req.body.ondernemingsnummer2}/references`,{
        headers:{
            'Accept' : 'application/json',
            'NBB-CBSO-Subscription-Key' : '091539ea0adb414d9eb51977a6afd3a8',
            'X-Request-Id' :''
            }}).then((response:any)=> response.json());;


    // Json data toewijzen bij onderming-objecten
    

    Promise.all([promise1,promise2])
    .then((json:any)=>{
        onderneming1 = json[0];
        
        bedrijven[0].name = `${onderneming1[0].EnterpriseName}`;
        bedrijven[0].address = `${onderneming1[0].Address.Street} ${onderneming1[0].Address.Number} ${onderneming1[0].Address.City}`;
        bedrijven[0].datumNeerlegging = `${onderneming1[0].DepositDate}`;

        onderneming2 = json[1];
        bedrijven[1].name = `${onderneming2[0].EnterpriseName}`;
        bedrijven[1].address = `${onderneming2[0].Address.Street} ${onderneming2[0].Address.Number} ${onderneming2[0].Address.City}`;
        bedrijven[1].datumNeerlegging = `${onderneming2[0].DepositDate}`;

        //  2de api call voor de cijfers uit te lezen

        let nummerOnderneming1 = onderneming1[0].ReferenceNumber;
        let nummerOnderneming2 = onderneming2[0].ReferenceNumber;

        let promise3 = fetch(`https://ws.uat2.cbso.nbb.be/authentic/deposit/${nummerOnderneming1}/accountingData`,{
            headers:{
                'Accept' : 'application/x.jsonxbrl',
                'NBB-CBSO-Subscription-Key' : '091539ea0adb414d9eb51977a6afd3a8',
                'X-Request-Id' :''
                }}).then((response:any)=> response.json());;
    
        let promise4 = fetch(`https://ws.uat2.cbso.nbb.be/authentic/deposit/${nummerOnderneming2}/accountingData`,{
            headers:{
                'Accept' : 'application/x.jsonxbrl',
                'NBB-CBSO-Subscription-Key' : '091539ea0adb414d9eb51977a6afd3a8',
                'X-Request-Id' :''
                }}).then((response:any)=> response.json());;
        Promise.all([promise3, promise4])
        .then((json:any)=>{

            //  onderneming 1 cijfers toekennen aan het object

            let onderneming1Cijfers = json[0];
            

            for (let i = 0;i<onderneming1Cijfers.lenght;i++){
                
                if(onderneming1Cijfers[i].Code == '10/15'){
                    bedrijven[0].eigenVermogen = onderneming1Cijfers[i].Value;
                }
                if(onderneming1Cijfers[i].Code = '42/48'){
                    bedrijven[0].schulden = onderneming1Cijfers[i].Value;
                }
                if(onderneming1Cijfers[i].Code == ''){
                    bedrijven[0].bedrijfsWinst = onderneming1Cijfers[i].Value;
                }
            }

            //  onderneming 2 cijfers toekenne aan het object

            //  periode 'N' pakken en NIET 'nm1'

            let onderneming2Cijfers = json[1];
            for (let i = 0;i<onderneming2Cijfers.lenght;i++){
                if(onderneming2Cijfers[i].Code == '10/15'){
                    bedrijven[1].eigenVermogen = onderneming1Cijfers[i].Value;
                }
                if(onderneming2Cijfers[i].COde == '42/48'){
                    bedrijven[1].schulden = onderneming1Cijfers[i].Value;
                }
                if(onderneming2Cijfers[i].Code == ''){
                    bedrijven[1].bedrijfsWinst = onderneming1Cijfers[i].Value;
                }
            }

            console.log(`eigen vermogen: ${bedrijven[0].eigenVermogen}`);

        })
        console.log(woord);
        
        res.render('vergelijking', {bedrijven: bedrijven}
    )})
    .catch((err:any)=>{
        console.log('Er is een foutmelding opgetreden: ' + err.message);
    })
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

export{};