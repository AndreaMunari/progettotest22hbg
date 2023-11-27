//requirements
const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const database = require('./database');

//set-up
const PORT = process.env.PORT || 5000;
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1"
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_TIMEOUT = process.env.REDIS_TIMEOUT || 5000;

//const client = redis.createClient(REDIS_HOST, REDIS_PORT, REDIS_TIMEOUT);
const redisUrl = 'rediss://red-clidj0dkt82s73d7nh8g:svOWSBMdFW1EWpA2fugkfHwTfw3QWZYr@frankfurt-redis.render.com:6379';
const client = redis.createClient({
    legacyMode: true,
    redisUrl,
});

client.connect();

const app = express();

const URL= process.env.BASE_URL||'https://22hbg.com/wp-json/wp/v2/posts';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "Progetto test 22HBG backend",
            version: '1.0.0'
        },
        servers: [
            {
                url: 'http://localhost:5000'
            }
        ]
    },
    apis: ['app.js']
}

const swaggerSpec = swaggerJsDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//--<API>--

//GET /posts
//This GET call returns the list of all posts
/**
 * @swagger
 * /posts:
 *  get:
 *      summary: This api call is used to fetch the list of all posts
 *      description: This api call is used to fetch the list of all posts from the feed
 *      responses:
 *          200:
 *              description: returns a json file containing all posts from the feed
 */
app.get('/posts', (req, res) => {
   
    fetch(URL)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const postList = [];
        k = data;
        // console.log(k);

        postList.push(k);
        console.log('my data ', postList); // This gives me all the posts

        res.json(postList);
    })
    .catch(error => {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
    
});

//cache middleware
async function cache (req, res, next) {
    try {
        const redis_key = req.query.title+req.query.items;
        console.log("REDIS_KEY_CACHE="+redis_key);

        const data = await client.get(redis_key);
        if (data !== null) {
            res.json(JSON.parse(data));
        } else {
            next();
        }

    } catch (error) {
        console.error('cache error: ', error);
        next();
    }
}

//GET /posts-filtered?title=<text to search in title>&items=<num of posts to return>
//This GET call returns the list of all posts filtering
//based on the parameters:
//• title: filter only the posts containing the string specified in this parameter
//• items: number of posts to return
//If the number of posts matching the title ('matches') is less than 'items',
//it returns an array with length 'matches'
/**
 * @swagger
 * components:
 *      schema:
 *          post:
 *              type: object
 *              properties:
 *                  id:
 *                      type: integer
 *                  date:
 *                      type: string
 *                  date-gmt:
 *                      type: string
 *                  guid:
 *                      type: object
 *                  modified:
 *                      type: string
 *                  modified_gmt:
 *                      type: string
 *                  slug:
 *                      type: string
 *                  status:
 *                      type: string
 *                  type:
 *                      type: string
 *                  link:
 *                      type: string
 *                  title:
 *                      type: object
 *                      properties:
 *                          rendered:
 *                              type: string
 *                  content:
 *                      type: object
 *                  excerpt:
 *                      type: object
 *                  author:
 *                      type: integer
 *                  featured_media:
 *                      type: integer
 *                  comment_status:
 *                      type: string
 *                  ping_status:
 *                      type: string
 *                  sticky:
 *                      type: boolean
 *                  template:
 *                      type: string
 *                  format:
 *                      type: string
 *                  meta:
 *                      type: object
 *                  categories:
 *                      type: array
 *                  tags:
 *                      type: array
 *                  yoast_head:
 *                      type: string
 *                  yoast_head_json:
 *                      type: object
 *                  _links:
 *                      type: object
 */     
/**
 * @swagger
 * /posts-filtered:
 *  get:
 *      summary: This api call is used to fetch a list of filtered posts
 *      parameters:
 *          - in: query
 *            name: title
 *            schema:
 *              type: string
 *            required: true
 *            description: filter only the posts containing the string specified in this parameter
 *          - in: query
 *            name: items
 *            schema:
 *              type: integer
 *            required: true
 *            description: number of posts to return
 *      description: This api call is used to fetch a list of 'items' filtered posts from the feed that contain the string specified in 'title'
 *      responses:
 *          200:
 *              description: returns a json file containing the 'items' posts from the feed matching 'title'.
 *              content:
 *                  application/json: 
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#components/schema/post'
 */
app.get('/posts-filtered', cache, (req, res, next) => {
    fetch(URL)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Fetching data...")
        const postList = [];
        const filteredData = data.filter(element =>
            element.title.rendered.includes(req.query.title)
        );

        for (let i = 0; i < req.query.items && i < filteredData.length; i++) {
            postList.push(filteredData[i]);
        }

        console.log('my data ', postList); // This gives me the filtered posts

        //create a key to cache this result
        redis_key = req.query.title+req.query.items;
        console.log("THE REDIS KEY IS:"+redis_key);
        //memorize in cache for one hour
        client.setEx(redis_key, 3600, JSON.stringify(postList));

        res.json(postList);
    })
    .catch(error => {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

//GET /sync-db
//This GET call reads the contents from the feed and writes them
//in the ‘posts’ table in the database
/**
 * @swagger
 * /sync-db:
 *  get:
 *      summary: This api call is used to fetch the list of all posts and to write it on the db
 *      description: This api call is used to fetch the list of all posts from the feed and write it in the posts table of the db
 *      responses:
 *          200:
 *              description: returns a string to inform the user about the success or failure of the SQL query
 */
app.get('/sync-db', (req, res) => {

    fetch(URL)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const postList = [];
        k = data;
        // console.log(k);

        postList.push(k);
        
        //extracting the info from the json file to put in the table
        console.log(postList);
        
        var query = "INSERT INTO posts ("+
            "ID, post_author, post_date, post_date_gmt, post_content, "+
            "post_title, post_excerpt, post_status, comment_status, "+
            "ping_status, post_modified, post_modified_gmt"+
            ") values ";
        let i;
        let values = '';
        for ( i= 0; i < postList[0].length; i++) {
            let post = postList[0][i];

            let id = post.id;
            let post_author = post.author;
            let post_date = post.date;
            let post_date_gmt = post.date_gmt;
            let post_content = post.content.rendered;//remove the 'rendered' if it doesn't work
            let post_title = post.title.rendered;//same
            let post_excerpt = post.excerpt.rendered;//same
            let post_status = post.status
            let comment_status = post.comment_status; 
            let ping_status = post.ping_status; 
            let post_modified = post.modified;
            let post_modified_gmt = post.modified_gmt;
            
            
            if(i == postList[0].length-1) {
                values += '('+id+', '+
                            post_author+', '+//int, it doesn't need quotes
                            `'${post_date}', ` +//enclose the date in single quotes
                            `'${post_date_gmt}', `+//same
                            `${database.escape(post_content)}, `+// Escape the post content
                            `${database.escape(post_title)}, `+ //same
                            `${database.escape(post_excerpt)}, `+//same
                            `'${post_status}', `+
                            `'${comment_status}', `+
                            `'${ping_status}', ` +
                            `'${post_modified}', `+
                            `'${post_modified_gmt}')`;
                console.log("\n"+values+"\n");
            } else {
                values += '('+id+', '+
                            post_author+', '+//int, it doesn't need quotes
                            `'${post_date}', ` +//enclose the date in single quotes
                            `'${post_date_gmt}', `+//same
                            `${database.escape(post_content)}, `+// Escape the post content
                            `${database.escape(post_title)}, `+ //same
                            `${database.escape(post_excerpt)}, `+//same
                            `'${post_status}', `+
                            `'${comment_status}', `+
                            `'${ping_status}', ` +
                            `'${post_modified}', `+
                            `'${post_modified_gmt}'),`;
                console.log("\n"+values+"\n");
            }
            
            //query+=values;
        }
        query+=values;
        console.log(query);
        //res.json(postList);
        
        let resText = "Requested adding i="+i+" rows to the database table 'posts'.<br><br>";
        database.query(query, (error, data)=>{
            if(error) {
                res.send(resText+"Request had some errors:<br>"+error)
            } else {
                res.send(resText+"Request completed");
            }
        })
        
    })
    .catch(error => {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

//GET /posts-db
//This GET call reads and returns the contents in the 'posts'
//table of the database
/**
 * @swagger
 * /posts-db:
 *  get:
 *      summary: This api call is used to fetch the contents of the 'posts' table in the database
 *      description: This api call is used to fetch the contents of of the 'posts' table in the database and to display the results in a JSON format
 *      responses:
 *          200:
 *              description: returns a JSON document containing the posts stored in the 'posts' table of the database
 */
app.get('/posts-db', (req, res)=> {
    var query = "SELECT * FROM posts";

    database.query(query, (error, data)=>{
        if(error) {
            throw error;
        }
        const ris = JSON.stringify(data, null, 2);
        console.log(ris);
        res.header('Content-Type', 'application/json');
        res.send(ris);
    });
    
});

//GET /posts-db-del
//This GET call deletes all the contents from the 'posts'
//table of the database
/**
 * @swagger
 * /posts-db-del:
 *  get:
 *      summary: This api call is used to delete all rows in 'posts' table.
 *      description: This api call is used to delete all rows in 'posts' table. Useful to clean the database.
 *      responses:
 *          200:
 *              description: returns a string to inform the user about the success or failure of the SQL query
 */
app.get('/posts-db-del', (req, res)=> {
    var query = "DELETE FROM posts";

    let resText = "Request to delete all rows in 'posts' table.<br>";
    database.query(query, (error, data)=>{
        if(error) {
            res.send(resText+"Request had some errors:<br>"+error);
        } else {
            res.send(resText+"Request completed succesfully");
        }
    });
    
});
//--</API>--


//server
app.listen(PORT, () => console.log(`listening on ${PORT}`))