
const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb+srv://jeroen:DB_password@cluster0.l80su.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {  useUnifiedTopology: true});

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
    bedrijfsWinst: number,
    rubrics : Rubrics,
    eigenVermogenKleur: string,
    schuldenKleur: string,
    bedrijfsWinstKleur: string
}
interface Rubrics {
    code:string,
    value : number,
    period : string,
    datatype :string,
    typeamout : string
}
interface OndernemingVoorDB{
    name: string,
    address: string,
    datumNeerlegging: string,
    eigenVermogen: number,
    schulden: number,
    bedrijfsWinst: number
}

let OndernemingenInDB: OndernemingVoorDB[] = [];

const bedrijven:Onderneming[] = [
    {
        name: "IT bedrijf 200",
        address: "Computerstraat 12",
        datumNeerlegging: "10-20-2020",   
        eigenVermogen: 0,
        schulden: 0,
        bedrijfsWinst: 0,
        rubrics: {
            code : "",
            value :0,
            period : "",
            datatype: "",
            typeamout :""
        },
        eigenVermogenKleur: "green",
        schuldenKleur: "black",
        bedrijfsWinstKleur: "yellow"
    },
    {
        name: "IT bedrijf 2",
        address: "Pcstraat 42b",
        datumNeerlegging: "02-01-2021",      
        eigenVermogen: 0,
        schulden: 0,
        bedrijfsWinst: 0,
        rubrics : {
            code : "",
            value :0,
            period : "",
            datatype: "",
            typeamout :""

        },
        eigenVermogenKleur: "blue",
        schuldenKleur: "brown",
        bedrijfsWinstKleur: "black"
    }
]

//  ROUTES

app.get('/', async (req:any, res:any) => {
    res.render('index');
});

app.post('/', async (req:any, res:any) => {

    // legen objecten aanmaken en fetch promises

    let woord = "origineel";

    let onderneming1: any = {};
    let onderneming2: any = {};

    let onderneming1Cijfers: any = {};
    let onderneming2Cijfers: any = {};

    const headerOptions = {
        'Accept' : 'application/json',
        'NBB-CBSO-Subscription-Key' : '091539ea0adb414d9eb51977a6afd3a8',
        'X-Request-Id' :''
    }
    const url = `https://ws.uat2.cbso.nbb.be/authentic/legalEntity/${req.body.ondernemingsnummer1}/references`
    const url2 = `https://ws.uat2.cbso.nbb.be/authentic/legalEntity/${req.body.ondernemingsnummer2}/references`

    let promise1 = await fetch (url, {headers: headerOptions}).then((response:any)=> response.json());;

    let promise2 = await fetch (url2, {headers: headerOptions}).then((response:any)=> response.json());;
    
//----------------------------
        onderneming1 = promise1[0];

        bedrijven[0].name = `${onderneming1.EnterpriseName}`;
        bedrijven[0].address = `${onderneming1.Address.Street} ${onderneming1.Address.Number} ${onderneming1.Address.City}`;
        bedrijven[0].datumNeerlegging = `${onderneming1.DepositDate}`;

        onderneming2 = promise2[0];

        bedrijven[1].name = `${onderneming2.EnterpriseName}`;
        bedrijven[1].address = `${onderneming2.Address.Street} ${onderneming2.Address.Number} ${onderneming2.Address.City}`;
        bedrijven[1].datumNeerlegging = `${onderneming2.DepositDate}`;

        //  2de api call voor de cijfers uit te lezen

        let nummerOnderneming1 = onderneming1.ReferenceNumber;
        let nummerOnderneming2 = onderneming2.ReferenceNumber;

        const headers= {
            'Accept' : 'application/x.jsonxbrl',
            'NBB-CBSO-Subscription-Key' : '091539ea0adb414d9eb51977a6afd3a8',
            'X-Request-Id' :''
            }
      
        const url3 = `https://ws.uat2.cbso.nbb.be/authentic/deposit/${nummerOnderneming1}/accountingData`
        const url4 = `https://ws.uat2.cbso.nbb.be/authentic/deposit/${nummerOnderneming2}/accountingData`

        let promise3 = fetch(url3, {headers:headers}).then((response:any)=> response.json());;
    
        let promise4 = fetch(url4, {headers:headers}).then((response:any)=> response.json());;

        Promise.all([promise3, promise4])
        .then((json:any)=>{

            //  onderneming 1 cijfers toekennen aan het object

            

            let onderneming1Cijfers = json[0];

            for (let i = 0;i<onderneming1Cijfers.Rubrics.length;i++){
                
                if(onderneming1Cijfers.Rubrics[i].Code == '10/15' && onderneming1Cijfers.Rubrics[i].Period === 'N'){
                    bedrijven[0].eigenVermogen = onderneming1Cijfers.Rubrics[i].Value;
                    
                }
                if(onderneming1Cijfers.Rubrics[i].Code == '42/48' && onderneming1Cijfers.Rubrics[i].Period === 'N'){
                    bedrijven[0].schulden = onderneming1Cijfers.Rubrics[i].Value;
                    
                }
                if(onderneming1Cijfers.Rubrics[i].Code == '14' && onderneming1Cijfers.Rubrics[i].Period === 'N'){
                    bedrijven[0].bedrijfsWinst = onderneming1Cijfers.Rubrics[i].Value;
                    
                }
            }

            //  onderneming 2 cijfers toekenne aan het object

            //  periode 'N' pakken en NIET 'nm1'

            let onderneming2Cijfers = json[1];
            for (let i = 0;i<onderneming2Cijfers.Rubrics.length;i++){

                if(onderneming2Cijfers.Rubrics[i].Code == '10/15' && onderneming2Cijfers.Rubrics[i].Period === 'N'){
                    bedrijven[1].eigenVermogen = onderneming2Cijfers.Rubrics[i].Value;
                    
                }
                if(onderneming2Cijfers.Rubrics[i].Code == '42/48' && onderneming2Cijfers.Rubrics[i].Period === 'N'){
                    bedrijven[1].schulden = onderneming2Cijfers.Rubrics[i].Value;
                    
                }
                if(onderneming2Cijfers.Rubrics[i].Code == '14' && onderneming2Cijfers.Rubrics[i].Period === 'N'){
                    bedrijven[1].bedrijfsWinst = onderneming2Cijfers.Rubrics[i].Value;
                    
                }
            }
    (async() => {
        try{
            await client.connect();
            
            let ondernemingenCollection = client.db("ITproject").collection("Ondernemingen");

            let gegevens: OndernemingVoorDB[] = [
            {
                name: bedrijven[0].name,
                address: bedrijven[0].address,
                datumNeerlegging: bedrijven[0].datumNeerlegging,
                eigenVermogen: bedrijven[0].eigenVermogen,
                schulden: bedrijven[0].schulden,
                bedrijfsWinst: bedrijven[0].bedrijfsWinst
            },
            {
                name: bedrijven[1].name,
                address: bedrijven[1].address,
                datumNeerlegging: bedrijven[1].datumNeerlegging,
                eigenVermogen: bedrijven[1].eigenVermogen,
                schulden: bedrijven[1].schulden,
                bedrijfsWinst: bedrijven[1].bedrijfsWinst
            }];
            await ondernemingenCollection.insertMany(gegevens);
            
        } catch(e){
            console.error(e);
            res.render('error');
        } finally{
            await client.close();
            }
        })();
    
    res.render('vergelijking', {bedrijven: bedrijven}
    )})
    .catch((err:any)=>{
        console.log('Er is een foutmelding opgetreden: ' + err.message);
        res.render('error');
    })

});

app.get('/about', (req:any, res:any) =>{
    res.render('about');
});

app.get('/contact', (req:any, res:any) => {
    res.render('contact');
});

app.get('/history',(req:any,res:any)=>{

    //let bedrijvenInDB: OndernemingVoorDB[] = [];

    

    const leesDB = async () => {
        try{
            await client.connect();

            let ondernemingenCollection = client.db("ITproject").collection("Ondernemingen");
            let allOndernemingen = await ondernemingenCollection.find({}).toArray();
            OndernemingenInDB = allOndernemingen;
        }
        catch(e){
            console.error(e);
            res.render('error');
        }
        finally{
            await client.close();
        }
        res.render('history', {bedrijvenInDB: OndernemingenInDB});
        

    }

    leesDB();
    
});

app.get('/removehistory',(req:any,res:any)=>{

    const removeHistory = async () => {
        try{
            await client.connect();
            await client.db("ITproject").collection("Ondernemingen").deleteMany({});
            console.log("History Removed");
        }
        catch(e){
            console.error(e);
            res.render('error');
        }
        finally{
            await client.close();
            
        }
    }
    removeHistory();
    res.render('history', {bedrijvenInDB: []});
})

//  AP STARTUP
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), ()=>console.log( `[server] http://localhost:` + app.get('port')));

//  last
app.use((req:any, res:any) => {
    res.status(404).render('index');
})

