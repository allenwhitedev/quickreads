const express = require('express')
const app = express()

// import keys & sensitive data from config (ignored in .gitignore)
const config = require('./config')
const GOOGLE_CUSTOM_SEARCH_API_KEY = config.GOOGLE_CUSTOM_SEARCH_API_KEY
const GOOGLE_CX = config.GOOGLE_CX

const request = require('request') // used to make http requests to google & web scrape

app.listen(8001, () => console.log('Quickreads express app listening on port 8001'))


app.get('/', (req, res) => res.sendFile(__dirname + '/index.html') )
app.get('/test', (req,res) => res.send({message: 'Success!'}))

// uses Google Custom Search API to search for lectures 
app.get('/scrape/:searchQuery', (req, res) =>
{
	let searchQuery = req.params.searchQuery
	request(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${GOOGLE_CX}&q=${searchQuery}`, (error, response, body) => 
	{
		console.log('statusCode:', response && response.statusCode)
		console.log('body:', body)
		res.send({ error: error, message: `Google api tested succesfully! Here is the body: ${body}` })
	})
})


// read length is calculated using average reading speed of adult (275 wpm)
// first image gets 12 seconds, second gets 11 seconds, then 10 seconds, until 3 seconds is given for each image
