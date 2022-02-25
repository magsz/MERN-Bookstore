// Practice creating a server using NODE and EXPRESS
// Creates a server 
// Implements using calls to server, such as GET, POST, PUT, and DELETE.
const { request, response } = require("express"); // Initializing express from modules 
const express = require("express"); 
const app = express(express.json()); // creates an express app
let bodyParser = require('body-parser');

const AuthorModel = require("./Models/Author.js");

const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');

app.use((bodyParser.json())); // This will let the app read JSON passed through the body

const url = "mongodb+srv://magsz:NovaAkamaru171!@cluster0.dksle.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const client = new MongoClient(url, {useNewUrlParser: true});

//Database Name
const DB = 'BookstoreBD';

// initialize database variable
let database;

// Async await function used to connect to database
const initDB = async () => {

    const connection = await client.connect();
    
    // if connection is true then connect to DB and display message in console
    // else display error message 
    if (connection){
        database = client.db(DB);
        console.log("Succesfully connected to the DB");
    } else{
        console.log("Error connecting to DB");
    }
}

initDB();

// create a variable that holds the collection from database
// in this case it is collection titled BookstoreDB, connects to cluster
const collection = database.collection('BookstoreDB');

let authors = [];
let authorId = 0;
let books = [];
let bookIdCounter = 0;

// KEY TO ACCESS API FOR NAMES OF BOOKS/AUTHORS
const config = {
    headers: {
        'X-API-Key': "6dd8b1b98ae64ee08d11649e63ee6348"
    }
}


const initializeNames = async () => {
   const authors= [];
   const firstNamesResponse =  await axios.get("https://randommer.io/api/Name?nameType=firstname&quantity=20",config);
   const lastNameResponse = await axios.get("https://randommer.io/api/Name?nameType=surname&quantity=20", config);
  
  firstNamesResponse.data.forEach((firstName, index) =>{
      const newAuthor = {
          firstName: firstName,
          lastName: lastNameResponse.data[index]
      }

      authors.push(newAuthor);
  })
    
    await AuthorModel.create(authors);
}

const initializeBooks = async () =>{
    const bookTitles = await axios.get("https://randommer.io/api/Text/LoremIpsum?loremType=normal&type=words&number=250",config);
    
    bookTitles.data.split(/,|\./).forEach((booktitle) =>{ 
        const assignedAuthor = authors[Math.floor(Math.random()*authors.length)];

        const book = {
            id: bookIdCounter++,
            authorId: assignedAuthor.id,
            title: booktitle
        };

        books.push(book);
        assignedAuthor.book.push(book);
    })
};

const initializeAllData = async () => {
    await initializeNames();
    await initializeBooks();

   // console.log(`Author data initialized: ${JSON.stringify(authors)}`);
    //console.log(`Book data initialized: ${JSON.stringify(books)}`);
}

initializeAllData();



// App begins to listen on a specific PORT, in this case it is port 8080.
app.listen(80, () =>{
    console.log("server is running!!");
});

// GET REQUEST THAT WILL RETURN ALL THE BOOKS
app.get('/book', (req,res)=>{
    res.send(books);
})

// GET REQUEST THAT WILL FIND SPECIFIC AUTHOR BY BOOK ID
app.get('/book/:id', (req,res) => {
    const foundBook = books.find((book) =>{
            return book.id === parseInt(req.params.id);
    });

    const foundAuthor = authors.find((author) =>{
        return author.id === parseInt(foundBook.authorId);
    });

    res.send(foundAuthor ? foundAuthor : 404);
});

// GET REQUEST THAT RETURNS AUTHOR BY AUTHOR ID
app.get('/author/:id', (req,res) => {
        const foundAuthor = authors.find((author) => {
                return author.id === parseInt(req.params.id);
        });

        res.send(foundAuthor ? foundAuthor : 404);
})




// POST REQUEST WILL POST A NEW BOOK TO BOOKS
app.post('/Book', (req,res) => {
    let newBook = req.body;
    newBook.id = books.length;
    newBook.author = findAuthor(req.body.authorId) || createNewAuthor(req.body.author);

    books.push(newBook);
    res.send(newBook);

});

const findAuthor = (authorToFind) =>{
    const foundAuthor = authors.find((author) => {
        return authorToFind.firstName === author.firstName && authorToFind.lastName === author.lastName;
    });
};

const createAuthor = (authorToCreate) =>{
        authorToCreate.id = authors.length;
        authors.push(authorToCreate);
        return authorToCreate;
};

// DELETE REQUEST WILL DELETE AN AUTHOR by ID

app.delete('/author/:id', (req,res) =>{
     const foundAuthor = authors.find((author) => {
                return author.id === parseInt(req.params.id);
        });

     authors.splice(indexOf(foundAuthor),1);
    
    res.send(foundAuthor? foundAuthor: 404);
});
