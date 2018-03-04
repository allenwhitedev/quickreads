const express = require('express')
const app = express()

// import keys & sensitive data from config (ignored in .gitignore)
const config = require('./config')
const GOOGLE_CUSTOM_SEARCH_API_KEY = config.GOOGLE_CUSTOM_SEARCH_API_KEY
const GOOGLE_CX = config.GOOGLE_CX

const request = require('request') // used to make http requests to google & web scrape
const cheerio = require('cheerio') // used to parse web scraped html

app.listen(8001, () => console.log('Quickreads express app listening on port 8001'))
app.use( express.static('public') ) // serve static assets (images) from public directory


app.get('/', (req, res) => res.sendFile(__dirname + '/index.html') )
app.get('/test', (req,res) => res.send({message: 'Success!'}))

// uses Google Custom Search API to search for lectures 
app.get('/search/:searchQuery', (req, res) =>
{
	let searchQuery = req.params.searchQuery
	request(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${GOOGLE_CX}&q=${searchQuery}`, 
		(error, response, body) => 
		{
			console.log('statusCode:', response && response.statusCode)
			
			let googleSearchResults = JSON.parse(body).items
			res.send({ error, searchResult: JSON.stringify(googleSearchResults) })
		}
	)
})

app.get('/scrape', (req, res) =>
{
	request(req.query.link, (error, response, body) =>
		{
			console.log('statusCode:', response && response.statusCode)

			let $ = cheerio.load(body)
			let wordCount = $('body').text().split(' ').length
			let imageCount = $('body img').length

			
			let viewingImagesTime = calculateViewingImagesTime(imageCount) // add time viewing images to read time
			let readTime = ( wordCount / 275 )  // average reading speed of adult (275 wpm), read time is in minutes
			readTime += viewingImagesTime / 60

			res.send({error, readTime: readTime})
		}
	)
})

// first image gets 12 seconds, second gets 11 seconds, then 10 seconds, until 3 seconds is given for each image
function calculateViewingImagesTime(numImages) 
{
	let totalTime = 0
	let imageViewingTime = 12

	for ( let i = 0; i < numImages; i++ )
	{
		if ( imageViewingTime > 3 )
		{
			totalTime += imageViewingTime
			imageViewingTime--
		}
		else
			totalTime += 3
	}
	return totalTime
}



