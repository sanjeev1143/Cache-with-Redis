const express = require('express');
const app = express();
const Redis = require('redis');

const client = Redis.createClient({
    host: '127.0.0.1',
    port: 6379
});

(async () => {
    client.connect();
 })();

const DEFAULT_EXPIRATION = 7200;



function getOrSetCache(key,callback){
    return new Promise(async (resolve,reject)=>{
        const cachedData = await client.get(key);
        if(cachedData!=null){
            console.log("Cache Hit");
            return resolve(JSON.parse(cachedData));
        }else{
            console.log("Cache Miss");
            const freshData = await callback();
            client.setEx(key,DEFAULT_EXPIRATION,JSON.stringify(freshData))
            resolve(freshData); 
        }
    })
}



app.get('/',(req,res)=>{
    res.send("Backend is running. . . ");
})

app.get('/photos',async (req,res)=>{
  
    const photos = await getOrSetCache('photos',async ()=>{
        const url = "https://jsonplaceholder.typicode.com/photos"
        const photoslist = await fetch(url);
        const data = await photoslist.json();
        return data;
    })

    res.json(photos);
 

})


app.get('/photos/:id',async (req,res)=>{
    const id = req.params.id;


    const data = await getOrSetCache(`photos?Id=${id}`,async ()=>{
                const url = `https://jsonplaceholder.typicode.com/photos/${id}`
        const photos = await fetch(url);
        const data = await photos.json();
        return data;
    })
    res.json(data);
   
})




app.listen(8000,()=>{
    console.log("Listening to port number 8000");
})